const pattern = {
	'a' : '00000',
	'b' : '00001',
	'c' : '00010',
	'd' : '00011',
	'e' : '00100',
	'f' : '00101',
	'g' : '00110',
	'h' : '00111',
	'i' : '01000',
	'j' : '01001',
	'k' : '01010',
	'l' : '01011',
	'm' : '01100',
	'n' : '01101',
	'o' : '01110',
	'p' : '01111',
	'q' : '10000',
	'r' : '10001',
	's' : '10010',
	't' : '10011',
	'u' : '10100',
	'v' : '10101',
	'w' : '10110',
	'x' : '10111',
	'y' : '11000',
	'z' : '11001',
	'/' : '11010',
	':' : '11011',
	'?' : '11100',
	'!' : '11101',
	'.' : '11110',
	' ' : '11111',
}

// encode a binary code into a QR-CODE
const encode = ( base, binary, freeColor=[0,0,0,0] ) => {
	let c = document.createElement("canvas");
		c.width		= base.naturalWidth;
		c.height	= base.naturalHeight;
	let ctx = c.getContext("2d");
		ctx.drawImage(base, 0,0);

	let i = 0;
	for (var y=0; y<c.height; y++) {
		for (var x=0; x<c.height; x++) {
			// break, if maximum character input is exceeded
			if(i>binary.length)
				break;
			// spotted a place that is free to put data into
			if( arrEq(Array.from(ctx.getImageData(x, y, 1, 1).data), freeColor)){
				ctx.fillStyle = parseInt(binary[i])? "#ffffff" : "#000000"
				ctx.fillRect(x,y,1,1);
				i++;
			}
		}
	}

	// fill the rest white
	ctx.globalCompositeOperation = "destination-over";
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0,0,c.width,c.height);
	ctx.globalCompositeOperation = "source-over";

	let out = new Image();
		out.src = c.toDataURL();
	return out;
}

// decode a QR-CODE to a binary string
const decode = async (base, img, threshold=0.7) => {
	let b = document.createElement("canvas"); // canvas for getting base pixel data
		b.width		= base.naturalWidth;
		b.height	= base.naturalHeight;
	let btx = b.getContext("2d");
		btx.drawImage(base, 0,0);
	let c = document.createElement("canvas"); // canvas for getting img pixel data
		c.width		= img.width;
		c.height	= img.height;
	let ctx = c.getContext("2d");
		ctx.drawImage(img, 0,0);
	let w = base.naturalWidth;
	let h = base.naturalHeight;
	let sx = img.width/w;
	let sy = img.height/h;
	// the threshold for how bright a pixel must be (0-1.0 : black white) to pass as black or white
	let thresholdBrightness = (luma(255,255,255,255)+luma(0,0,0,0))*threshold;
	// iterate over each pixel and determine stored data
	let binary = "";
	let i = 0;
	for (var y=0; y<h; y++) {
		for (var x=0; x<w; x++) {
			// base pixel data
			let baseRaw = Array.from(btx.getImageData(x,y,1,1).data);
			// determine if this pixel is used for data encoding or for pattern checking
			let free = baseRaw[3]==0;
			let baseData = luma(...baseRaw) >= threshold
			// image pixel data
			let imgData = luma(...avgCol(ctx, x*sx, y*sy, sx, sy)) >= thresholdBrightness;
			// read data
			if(free)
				binary+=( imgData?"1":"0" )
			else if(baseData != imgData){
				throw new Error('decoding pattern mismatch');
			}
		}
	}
	return binaryText(binary);
}

const textBinary = (
	text,
	encoding = pattern
) => text
	.toLowerCase()
	.split('')
	.map( e => encoding[e] )
	.join('')

const binaryText = (
	binary,
	decoding = Object.fromEntries( Object.values(pattern).map( (e,i) => [e,Object.keys(pattern)[i]] ) ) // build the inverse of the encoding
) => Array.from(binary)
	.map( (e,i) => (i+1)%Object.keys(decoding)[0].length? e:e+',' ) // split the binary into parts of equal length
	.join('')
	.split(',')
	.map( e => decoding[e])
	.join('')

// RGB -> Lumen (returns brigntness of a color
const luma = (r,g,b,a) => (0.33*r + 0.5*g + 0.16*b)*a;

// Compare two Lists for euqality
const arrEq = (m,n) => m.map( (e,i) => e==n[i]).filter( e => e==false)==0;

// returns the average color
const avgCol = (ctx, x,y, w,h) => Array.from(ctx.getImageData(x,y,w,h) .data)
	.map( (e,i) => (i+1)%4?e:e+"|" )	// convert to a [r,g,b,a] list
	.join()
	.split('|,')
	.map( e => e.replace('|',''))
	.map( e => e.split(',') )
	.reduce( (acc,cur,idx,src) => [		// reduce to average
			acc[0]+cur[0]/src.length,
			acc[1]+cur[1]/src.length,
			acc[2]+cur[2]/src.length,
			acc[3]+cur[3]/src.length,
		], [0,0,0,0] )
