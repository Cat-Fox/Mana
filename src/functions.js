String.prototype.splice = function (idx, rem, s) {
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

function convertCanvasToImage (canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}

function convertImageToCanvas (image) {
	var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0);

	return canvas;
}