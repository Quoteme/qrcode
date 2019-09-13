![](https://i.imgur.com/clITFAl.jpg)

### What is a base?
A base is a small PNG, consisting of three different types of pixels


| Pixel			| Effect													|
| ------------- | --------------------------------------------------------- |
| Black			| denotes a black pixel on the QR-Code for error checking	|
| White			| denotes a white pixel on the QR-Code for error checking	|
| Transparent	| denotes an empty space, where information can be stored	|

### How do I add a base?
To add different bases, follow these steps:
1. copy your base to ```res/base/yourbase.png```
2. add an entry ```<img src="res/base/yourbase.png" class='decodeBase'/>``` into the index.html where all the other such bases are listed
Alternatively, you can just upload your base online and access it by entering the link into the 'BASE URL' input fields

### How do I change my base?
Simply click on a different base at the top of the app (under the word 'BASES')

### How do I use this in my own code?
1. Copy the file ```js/qrcode.js``` into your project
2. Add a script tag into your html file : ```<script src="js/qrcode.js" charset="utf-8"></script>```

#### How do I create a QR-Code?
after importing the code into your project, call this function:
```
encode( base, binary, freeColor )
```

```base``` is the base (as an ```Image``` object)

```binary``` is a string of '100101...' (zeros will become white, ones will become black)

optional ```freeColor``` is an array [r,g,b,a] which denotes the color of pixels which are free to put data into (on the base)

#### How do I read a QR-Code?
after importing the code into your project, call this function:
```
decode( base, img, threshold )
.catch( e => {})
.then( e => functionYouWantToApplyToReadString(e) )
```

```base``` is the base (as an ```Image``` object)

```img``` is the image that should be analyzed (make sure the image is cut before, so that it only portraits the QR-Code, which is not rotated and not tilted)

optional ```threshold``` is a floating point value between 0 and 1. It determines how dark a section of the image must be, in order to be considered a black or white pixel (0 -> all pixels are white, except the ones that are 100% black, 1 -> all pixels are black, except the ones which are 100% white)
