// Onload Function //
$(document).ready(function($) {
    // Adding Accordian Handler to accordians //
    $('.accord').find('.accordbtn').click(function(){
        $(this).next().slideToggle('fast');
        //Hide the other panels
        // $(".accordcon").not($(this).next()).slideUp('fast');
    });
});