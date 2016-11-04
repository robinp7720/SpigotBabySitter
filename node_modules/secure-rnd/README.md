# Secure Rnd

This module provide a secure random generation using a Tom Wu library.
To create documentation you must install [JSDuck](https://github.com/senchalabs/jsduck) and type in your terminal:

    $ ./gen_doc.sh

## Usage

Load `secure-rnd` into your app:

    var Random  = require('secure-rnd');
    var rnd = new Random();
    var codes  = [];
    codes.length = 10;
    rnd(codes);
    console.log(codes);

See full documentation into _doc_ folder.
For more informations see [RSA and ECC in Javascript](http://www-cs-students.stanford.edu/~tjw/jsbn/)