
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