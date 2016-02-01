$(document).ready(function ($) {
    
    //Create global variables
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
        
        //Add amountChange to the player's current amount of $
        var playerObject = getPlayerObject($(lastInput).data("playername"));
        playerObject.dollars = parseInt(playerObject.dollars) + parseInt(amountChange);
        playerAmount.val(playerObject.dollars);
        
        //Clear all input fields and add the transaction to the activity log
        $(".dollarsAddSubtract").val("");
        $("#activityLog").prepend(playerObject.playerName + ": " + opColorOpenTag + operation 
                                  + "$" + Math.abs(amountChange) + spanCloseTag + "<br>");

        //Trigger the keyup handler on lastInput to disable Add $ and Subtract $ buttons
        $(lastInput).keyup();
        savePlayerData();
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
            $(".startGameElement").removeClass("invisible")
                                  .hide()
                                  .fadeIn(800)
                                  .removeAttr("disabled")
        }
        
        //Disable #btnCreatePlayer.  The keyup handler will enable it when valid data is input
        $("#btnCreatePlayer").attr("disabled", "disabled");
        
        return false;
    });
    
    //Register the click handler for #btnStartGame
    $("#btnStartGame").on("click", function(){
        
        //If there is no playerdata cookie, process items for a new game setup
        if (!($.cookie("playerdata"))){
        
            //If #startingAmount is not valid, disable the button, show the tooltip, and abort
            //This will only be hit if the user highlights the input with mouse and cuts, 
            //deletes, or pastes non-numerical data into it
            if(!$.isNumeric($("#startingAmount").val())){
                $("#startingAmount").tooltip("show");
                $("#btnStartGame").attr("disabled", "disabled").css("opacity", ".5");
                return;
            }

            //Add the starting amount to each player
            for(var i=0;i<playerArray.length;i++){
                playerArray[i].dollars = $("#startingAmount").val();
            }

            //Create the "Board" player to track "Free Parking"  money
            var newPlayer = new Object();
            newPlayer.playerName = "Board";
            newPlayer.dollars = 0;
            playerArray.push(newPlayer);
        } else {
            //If there is a cookie, put that data into playerArray
            playerArray = $.parseJSON($.cookie("playerdata"));
        };
        
        //Fade out the game setup elements and when the fadeOut is complete, concatenate the HTML for #playerPanel
        $("#newPlayerDiv, #newPlayerList").fadeOut(1000, function(){
            //This runs twice for some reason, so check if it's already been run
            if(playerPanelBuilt === true) return;
            
            playerPanelBuilt = true;
            var playerHtml = "";

            //Iterate through each player object in playerArray
            $.each(playerArray, function( index, value ) {
                
                //Concatenate the HTML for each player's controls
                dataPlayerName = " data-playername='" + value.playerName + "' "
                playerHtml += "<div class='playerDiv'><div class='playerName droppable'" + dataPlayerName + ">" + value.playerName + "</div>";
                playerHtml += ": $<input" + dataPlayerName + "class='playerDollars' disabled value='" + value.dollars + "'>";
                playerHtml += "<div class='draggable'" + dataPlayerName + "><input" + dataPlayerName + "class='dollarsAddSubtract' data-toggle='tooltip' "
                playerHtml += "title='Drag to another player&#39;s name to transfer money.'></div>";
                playerHtml += "<span" + dataPlayerName + " class='fa fa-chevron-left inactiveChevron'></span> <br>"
                playerHtml += "</div>";
            });
            
            //Add all of the player controls to #playerPanel, and fade in #gamePanel
            //playerHtml = $("#playerPanel").html() + playerHtml;
            $("#playerPanel").append(playerHtml);
            $("#gamePanel").fadeIn(1000);
            $("#activityLog").html("Game started!")
            
            //Initialize draggable elements
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
                        var playerTo = getPlayerObject($(this).data("playername"));
                        playerTo.dollars = parseInt($(this).nextAll("input").val()) + parseInt(amount);
                        $(this).nextAll("input").val(playerTo.dollars);
                        
                        //Subtract the amount from the user it was dragged from
                        var playerFrom = getPlayerObject($(ui.draggable).data("playername"));
                        playerFrom.dollars = parseInt($(ui.draggable).prev().val()) - parseInt(amount);
                        $(ui.draggable).prev().val(playerFrom.dollars);
                    
                        //Log the action and clear all .dollarsAddSubtract elements
                        $("#activityLog").prepend("$" + amount + " from " + spanRedOpenTag + playerFrom.playerName
                                                  + spanCloseTag + " to " + spanGreenOpenTag + playerTo.playerName + spanCloseTag + "<br>");
                        $(event.toElement).val("");
                        
                        //Trigger the keyup handler on lastInput to disable Add $ and Subtract $ buttons
                        $(lastInput).keyup();
                        
                        savePlayerData();
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
            $("#buttonAddMoney, #buttonSubtractMoney").removeAttr('disabled');
        } else {
            //If the element does not contain a valid number, disable the Add $ and Subtract $ buttons
            $("#buttonAddMoney, #buttonSubtractMoney").attr('disabled', 'disabled');
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
            if(getPlayerObject($("#newPlayer").val())){

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
            //If #startingAmount contains a number, enable the start button and make it opaque
            $("#btnStartGame").removeAttr("disabled");
            $("#btnStartGame").css("opacity", "1")
        }else{
            //If #startingAmount does not contain a number, disable the start button and make it half opaque
            $("#btnStartGame").attr("disabled", "disabled");
            $("#btnStartGame").css("opacity", ".5")
        }
    });
    
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
    
    function savePlayerData(){
        $.cookie("playerdata", JSON.stringify(playerArray), {expires: 365});
    }
    
    if($.cookie("playerdata")){
        $("#btnStartGame").trigger("click");
    }
    
    $("#btnNewGame").on("click", function(){
        $.removeCookie("playerdata");
        location.reload();
    });
})

var playerArray = new Array();
var playerPanelBuilt = false;

function getPlayerObject(player){
   for(var i=0;i<playerArray.length;i++){
       if(playerArray[i].playerName === player){
           return playerArray[i];
       }
   }
}
