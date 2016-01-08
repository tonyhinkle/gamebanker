$(document).ready(function ($) {
    
    //Create global variables
    var playerArray = new Array();
    var spanGreenOpenTag = "<span class='colorGreen'>";
    var spanRedOpenTag = "<span class='colorRed'>";
    var spanCloseTag = "</span>";
    var lastInput;

    //Set focus on the #newPlayer input
    $("#newPlayer").focus();
    
    //Initialize tooltips
    $('body').tooltip({
        selector: '[data-toggle=tooltip]',
        placement: 'auto',
        trigger: 'hover'
    });
    
    //Register the click event for the buttons to add and subtract money
    $(document).on("click", "#buttonAddMoney, #buttonSubtractMoney, #buttonAdd200", function(){
        
        if(!lastInput){return;}
        
        //Get the player's current amount of money, and initialize some other variables
        var playerAmount = $(lastInput).parent().prevAll(".playerDollars");
        var amountChange;
        var operation = "+";
        var opColorOpenTag = spanGreenOpenTag;

        //If an "Add $200" button was clicked, set amountChanged to 200
        if ($(this).attr("id") == "buttonAdd200"){
            amountChange = 200;
        }
        else{
            
            if(!$.isNumeric($(lastInput).val())){return;}
            
            //If an Add $ or Subtract $ button was clicked, set amountChanged to the appropriate input value
            amountChange = parseInt($(lastInput).val());
            
            //If Subtract $ was clicked, change it to a negative number and change some other variables
            if ($(this).attr("id") == "buttonSubtractMoney"){
                amountChange = -amountChange
                operation = "-";
                opColorOpenTag = spanRedOpenTag;
            }
        }
        
        //Add amountChange to the player's current amount of $, and clear the input
        playerAmount.val(parseInt(playerAmount.val()) + parseInt(amountChange));
        $(lastInput).val("");
        
        //Add the transaction to the activity log
        $("#activityLog").prepend($(lastInput).parent().prevAll(".playerName").data("playername") + ": " + opColorOpenTag + operation + "$" + Math.abs(amountChange) + spanCloseTag + "<br>");
    });
    
    //Register the click event for the "Clear" buttons
    $(document).on("click", "#buttonClear", function(){
        //Clear the current text input        
        $(lastInput).val("");
    });

    $("#btnCreatePlayer").on("click", function(){
        
        //If the user deleted the data in #newPlayer before clicking the button,
        //show the #newPlayer tooltip and return
        if($("#newPlayer").val() == ""){
            $("#btnCreatePlayer").attr("disabled", "disabled");
            $("#newPlayer").tooltip("show");
            return
        }
        
        //Create the new player object and add it to the newPlayer array
        var newPlayer = new Object();
        newPlayer.playerName = $("#newPlayer").val();
        newPlayer.dollars = "0";
        playerArray.push(newPlayer);
        $("#newPlayer").val("")
        
        var newPlayerListHtml = ""
        
        //Build a list of players
        $.each(playerArray, function( index, value ) {
            newPlayerListHtml += value.playerName + "<br>";
        });
        
        //Show the list of players in the #newPlayerList DIV
        $("#newPlayerList").html(newPlayerListHtml);
        
        //If it is the second player to be added, show the .startGameElement elements
        if(playerArray.length == 2){
            $(".startGameElement").css("opacity", "1");
            $(".startGameElement").hide();
            $(".startGameElement").fadeIn(1000);
            $("#btnStartGame, #startingAmount").removeAttr("disabled");
            $("#startingAmount").tooltip("enable");
        }
        
        //Disable #btnCreatePlayer.  The keyup handler will enable it when valid data is input
        $("#btnCreatePlayer").attr("disabled", "disabled");
        
        return false;
    });
    
    //Register the click handler for #btnStartGame
    $("#btnStartGame").on("click", function(){
        
        //If #startingAmount is not valid, disable the button, show the tooltip, and abort
        if(!$.isNumeric($("#startingAmount").val())){
            $("#startingAmount").tooltip("show");
            $("#btnStartGame").attr("disabled", "disabled");
            $("#btnStartGame").css("opacity", ".5")
            return;
        }
        
        //Create the "Board" player to track "Free Parking"  money
        var newPlayer = new Object();
        newPlayer.playerName = "Board";
        newPlayer.dollars = 0;
        playerArray.push(newPlayer);

        //Fade out the game setup elements and when the fadeOut is complete, concatenate the HTML for #playerPanel
        $("#newPlayerDiv, #newPlayerList").fadeOut(1000, function(){
            
            //Set startingAmount to the value of #startingAmount and initialize other variables
            var startingAmount = $("#startingAmount").val();
            var playerHtml = "";
                playerHtml += "<button type='button' id='buttonClear' class='btn btn-sm'>Clear</button>";
                playerHtml += "<button type='button' id='buttonAddMoney' class='btn btn-sm'>Add $</button>";
                playerHtml += "<button type='button' id='buttonSubtractMoney' class='btn btn-sm'>Subtract $</button>";
                playerHtml += "<button type='button' id='buttonAdd200' class='btn btn-sm'>Add $200</button>";

            
            //Iterate through each player object in playerArray
            $.each(playerArray, function( index, value ) {
                
                //If it is the last player (the "Board" player), set startingAmount to zero
                if(index == playerArray.length -1){
                    startingAmount = 0;
                }
                
                //Concatenate the HTML for each player's controls
                playerHtml += "<div class='playerDiv'><div class='playerName droppable' data-playername='" + value.playerName + "'>" + value.playerName + "</div>";
                playerHtml += ": $<input class='playerDollars' disabled value='" + startingAmount + "'>";
                playerHtml += "<div class='draggable'><input class='dollarsAddSubtract' data-toggle='tooltip' "
                playerHtml += "title='Drag to another player&#39;s name to transfer money.'></div>";
                playerHtml += "<span class='fa fa-chevron-left inactiveChevron'></span> <br>"
                playerHtml += "</div>";
            });
            
            //Add all of the player controls to #playerPanel, and fade in #gamePanel
            $("#playerPanel").html(playerHtml);
            $("#gamePanel").fadeIn(1000);
            $("#activityLog").html("Game started!")
            
            //Initializ draggable elements
            $(".draggable").draggable({
                start: function (event, ui) {
                    $(this).data('preventBehaviour', true);
                },
                revert : true
            });
            
            //Inputs cannot be draggable by default, so this is included to make them draggable.
            $(".draggable").find(":input").on('mousedown', function (e) {
                var mdown = new MouseEvent("mousedown", {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                view: window
            });
            
            //Inputs cannot be draggable by default, so this is included to make them draggable.
            $(this).closest('.draggable')[0].dispatchEvent(mdown);
            }).on('click', function (e) {
                var $draggable = $(this).closest('.draggable');
                if ($draggable.data("preventBehaviour")) {
                    e.preventDefault();
                    $draggable.data("preventBehaviour", false)
                }
            });
            
            //Initialize the droppable elements
            $( ".droppable" ).droppable({
                drop: function( event, ui ) {
                
                    //Get the value of the dropped element
                    var amount = parseInt(event.toElement.value);
                    
                    //If amount is a number, then process the action
                    if($.isNumeric(amount)){
                
                        //Add the amount to the user it was dropped on
                        $(this).nextAll("input").val(parseInt($(this).nextAll("input").val()) + amount);
                        
                        //Subtract the amount from the user it was dragged from
                        $(ui.draggable).prev().val(parseInt($(ui.draggable).prev().val()) - amount);
                    
                        //Log the action and clear all .dollarsAddSubtract elements
                        $("#activityLog").prepend("$" + amount + " from " + spanRedOpenTag + $(ui.draggable).prevAll('.playerName').data("playername") + spanCloseTag + " to " + spanGreenOpenTag + $(this).data("playername") + spanCloseTag + "<br>");
                        //$(".dollarsAddSubtract").val("");
                        $(event.toElement).val("");
                        
                        //Trigger the keyup handler on lastInput to disable Add $ and Subtract $ buttons
                        $(lastInput).keyup();
                    }
                }
            });
        });
    });
    
    //Register the focus event for .dollarsAddSubtract to set lastInput to the element that most recently had focus
    //This is done (primarily) so that the click handler for .bill DIVs knows where to add values
    $(document).on("focus", ".dollarsAddSubtract", function(){
        $(".activeChevron").removeClass("activeChevron").addClass("inactiveChevron");
        $(this).parent().next("span").addClass("activeChevron").removeClass("inactiveChevron");
        lastInput = this;
    });
    
    //Register the click event for the .bill DIVs
    //TODO: Rework using .isNumeric
    $(document).on("click", ".bill", function(){
        if(parseInt($(lastInput).val())){
            //If there is already a number there, add the DIVs bill value to it
            $(lastInput).val(parseInt($(lastInput).val()) + parseInt($(this).data("bill")));
        }else{
            //If there was not alread a number there, set it to the DIV's bill value
            $(lastInput).val(parseInt($(this).data("bill")));
        }
        //Trigger the keyup handler for lastInput to disable the Add $ and Subtract $ buttons
        $(lastInput).keyup();
    });
    
    //Register the keyup event for .dollarsAddSubtract elements
    $(document).on("keyup", ".dollarsAddSubtract", function(){
        if($.isNumeric($(lastInput).val())){
            //If the element contains a valid number, enable the Add $ and Subtract $ buttons   
            $(this).parent().nextAll('button').slice(1,3).removeAttr('disabled');
        } else {
            //If the element does not contain a valid number, disable the Add $ and Subtract $ buttons
            $(this).parent().nextAll('button').slice(1,3).attr('disabled', 'disabled');
        }
        $(".activeChevron").removeClass("activeChevron").addClass("inactiveChevron");
        $(lastInput).parent().next("span").addClass("activeChevron").removeClass("inactiveChevron");
    });
    
    //Register the mouseout handler for .dollarsAddSubtract to hide it's tooltip.  This typically would be necessary, 
    //but with the drag and drop functionality the tooltip was staying displayed after the drag and drop.
    $(document).on("mouseout", ".dollarsAddSubtract", function(){
        $('.tooltip').hide();
    });
    
    //Register the keyup handler for #newPlayer
    $("#newPlayer").on("keyup", function(){
        if($("#newPlayer").val() != ""){
            if(lookup(playerArray, "playerName", $("#newPlayer").val())){
                //If #newPlayer contains the name of an existing player, disable #btnCreatePlayer and show the tooltip
                $("#btnCreatePlayer").attr("disabled", "disabled");
                $("#newPlayer").tooltip("show");
            } else {
                //If #newPlayer contains data a name that doesn't conflict with an existing name, enable #btnCreatePlayer
                $("#btnCreatePlayer").removeAttr("disabled");
            }
        }else{
            //If #newPlayer is empty, disable #btnCreatePlayer
            $("#btnCreatePlayer").attr("disabled", "disabled");
        }
    });
    
    //Register the keyup handler for the #startingAmount input
    $("#startingAmount").on("keyup", function(){
        if($.isNumeric($("#startingAmount").val())){
            //If #startingAmount contains a number, enable it and make it opaque
            $("#btnStartGame").removeAttr("disabled");
            $("#btnStartGame").css("opacity", "1")
        }else{
            //If #startingAmount does not contain a number, disable it and make it half opaque
            $("#btnStartGame").attr("disabled", "disabled");
            $("#btnStartGame").css("opacity", ".5")
        }
    });
    
    //Disable the tooltip on #startingAmount as it isn't visible when the page loads
    $("#startingAmount").tooltip("disable");
    
    //Register the button that disables tooltips
    $("#btnDisableTooltips").on("click", function(){
        $('[data-toggle=tooltip]').tooltip("disable");
        $("#btnDisableTooltips").hide();
    });
    
    //Register the click event for the inactive lastInput chevron indicators
    $("body").on("click", ".inactiveChevron", function() {
        
        lastInput = $(this).prev("div").children("input");
        $(".activeChevron").removeClass("activeChevron").addClass("inactiveChevron");
        $(lastInput).parent().next("span").addClass("activeChevron").removeClass("inactiveChevron");

    });
})

//This function checks a given property of objects in an array to find a match for a given value
function lookup(array, prop, value) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i][prop] === value) return array[i];
}
