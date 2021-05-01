
 $('#left_side_loader_div').click(function () {
    // if ($('#left_side_menu').is(':visible')) {
    //     $('#left_side_loader_div').hide();
    //     $('#left_side_menu').animate({
    //     width: 'toggle'
    //     });
    // } 
    if ($('#ShowroomleftSideMenu').is(':visible')) {
        $('#left_side_loader_div').hide();
       // $('#ShowroomleftSideMenu').hide();
        $('#ShowroomleftSideMenu').animate({
            width: 'toggle'
        });
    } 
});

function mouseovershowhide(hoverId,imgID,hideId){
    //alert('df')
    $("."+hoverId).mouseover(function(){
        $("#"+hideId).css("display", "block");   
        $('.img-zoom-lens').css("display", "block");
       
      });
      $("."+hoverId).mouseout(function(){
        $("#"+hideId).css("display", "none");
		$('.img-zoom-lens').css("display", "none");
      });
     
}

function imageZoom(imgID, resultID) {   
    $("#"+resultID).show();
    var img, lens, result, cx, cy;
    img = document.getElementById(imgID);
    result = document.getElementById(resultID);
    /*create lens:*/
    lens = document.createElement("div");
    lens.setAttribute("class", "img-zoom-lens");
    /*insert lens:*/
    img.parentElement.insertBefore(lens, img);
    /*calculate the ratio between result DIV and lens:*/
    cx = result.offsetWidth / lens.offsetWidth;
    cy = result.offsetHeight / lens.offsetHeight;
    /*set background properties for the result DIV:*/
    result.style.backgroundImage = "url('" + img.src + "')";
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    /*execute a function when someone moves the cursor over the image, or the lens:*/
    lens.addEventListener("mousemove", moveLens);
    img.addEventListener("mousemove", moveLens);
    /*and also for touch screens:*/
    lens.addEventListener("touchmove", moveLens);
    img.addEventListener("touchmove", moveLens);
    function moveLens(e) {        
        var pos, x, y;
        /*prevent any other actions that may occur when moving over the image:*/
        e.preventDefault();
        /*get the cursor's x and y positions:*/
        pos = getCursorPos(e);
        /*calculate the position of the lens:*/
        x = pos.x - (lens.offsetWidth / 2);
        y = pos.y - (lens.offsetHeight / 2);
        /*prevent the lens from being positioned outside the image:*/
        if (x > img.width - lens.offsetWidth) {x = img.width - lens.offsetWidth;}
        if (x < 0) {x = 0;}
        if (y > img.height - lens.offsetHeight) {y = img.height - lens.offsetHeight;}
        if (y < 0) {y = 0;}
        /*set the position of the lens:*/
        lens.style.left = x + "px";
        lens.style.top = y + "px";
        /*display what the lens "sees":*/
        result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
    }
    function getCursorPos(e) {
        var a, x = 0, y = 0;
        e = e || window.event;
        /*get the x and y positions of the image:*/
        a = img.getBoundingClientRect();
        /*calculate the cursor's x and y coordinates, relative to the image:*/
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        /*consider any page scrolling:*/
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return {x : x, y : y};
    }
    $("#"+resultID).hide();
    }
    setInterval(() => {
        if($( window ).width() > $( window ).height()){           
            if($( window ).height() < 420){
            $('.showroom_landing_page_banner_img').css('object-fit','contain');
            }    
            else{
                $('.showroom_landing_page_banner_img').css('object-fit','cover');
            }      
        }else{           
            $('.showroom_landing_page_banner_img').css('object-fit','contain');

        }
        var thumbHeight =  $('.view_imagezoom #panel').height();
      //  console.log(thumbHeight);
        $('.shop_inner_inf #gallery #thumbs').css('height',thumbHeight);

    }, 200);
	