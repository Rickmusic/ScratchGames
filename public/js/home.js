// Onload Function //
$(document).ready(function($) {
    // Adding Accordian Handler to accordians //
    $('.accord').find('.accordbtn').click(function(){
        $(this).next().slideToggle('fast');
    });
    $('.accord').find('.accordbtn2').click(function(){
        $(this).next().slideToggle('fast');
        //Hide the other panels
        $(".accordcon").not($(this).next()).slideUp('fast');
    });
});