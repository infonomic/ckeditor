# Custom CKEditor5 with Downcast Converter

A 'proof of concept' editor CKEditor 5 and React.

- [CKEditor5](https://ckeditor.com/ckeditor-5/)

Hyperlinks are created automatically with 'space after link'

@mentions are enabled, and will insert a username at an inline element at the current cursor position.

## Setup

Relies on a custom CKEditor build which must be downloaded from here...

- [https://s3.ap-southeast-1.amazonaws.com/downloads.infonomic.io/ckeditor-ckeditor5-build-custom-2.2.1.tgz](https://s3.ap-southeast-1.amazonaws.com/downloads.infonomic.io/ckeditor-ckeditor5-build-custom-2.2.1.tgz)

Place `ckeditor-ckeditor5-build-custom-2.2.1.tgz` in a `custom_modules` directory in the project root (you'll need to create this directory).

and then run...

`yarn install`

`yarn start`