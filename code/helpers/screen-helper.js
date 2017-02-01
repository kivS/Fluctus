const potato = {};



potato.getXoffset = function(work_area_width, window_width){
	// will position the window to the right side
	return work_area_width - window_width - 5;
}

potato.getYoffset = function(work_area_height, window_height){
	// will position the window to the right side
	return work_area_height - window_height;
}



module.exports = potato;