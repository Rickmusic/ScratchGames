// Onload Function //
$(document).ready(function($) {
    // Adding Accordian Handler to side accordians //
    $('.accord').find('.accordbtn').click(function(){
        $(this).next().slideToggle('fast');
    });
    // Adding Accordian Handler to bottom accordians //
    $('.accord').find('.accordbtn2').click(function(){
        $(this).next().slideToggle('fast');
        //Hide the other panels
        $(".accordcon").not($(this).next()).slideUp('fast');
    });
    // Handling press of create lobby button //
    $('#createbtn').click(function(){
        $('.modal').css("display", "block");
    });
    $('.close').click(function(){
        $('.modal').css("display", "none");
    });
});