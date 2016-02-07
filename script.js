$(document).ready(function ($) {
    
    //Create global variables
    var spanGreenOpenTag = "<span class='colorGreen'>";
    var spanRedOpenTag = "<span class='colorRed'>";
    var spanCloseTag = "</span>";

    //Set focus on the #newPlayer input
    $("#newPlayer").focus();
    
    //Register the click event for the buttons to add and subtract money
    $(document).on("click", "#buttonAddMoney, #buttonSubtractMoney, #buttonAdd200", function(){
        
        //Get the player's current amount of money, and initialize some other variables
        var playerAmount = currentPlayer.dollars;
        var amountChange;
        var operation = "+";
        var opColorOpenTag = spanGreenOpenTag;

        //If the "Add $200" button was clicked, set amountChanged to 200
        if ($(this).attr("id") == "buttonAdd200"){
            amountChange = 200;
        }
        else{
            //If an Add $ or Subtract $ button was clicked, set amountChanged to the appropriate input value
            amountChange = parseInt($("#dollarsAddSubtract").val());
            
            //If Subtract $ was clicked, change it to a negative number and change some other variables
            if ($(this).attr("id") == "buttonSubtractMoney"){
                amountChange = -amountChange
                operation = "-";
                opColorOpenTag = spanRedOpenTag;
            }
        }
        
        //Add amountChange to the player's current amount of $
        currentPlayer.dollars = parseInt(currentPlayer.dollars) + parseInt(amountChange);
        updatePlayerDollars();
        
        //Add the transaction to the activity log
        $("#activityLog").prepend(currentPlayer.playerName + ": " + opColorOpenTag + operation 
                 + "$" + Math.abs(amountChange) + spanCloseTag + "<br>");
    });
    
    //Register the click event for the "Clear" buttons
    $(document).on("click", "#buttonClear", function(){
        //Clear the current text input        
        $("#dollarsAddSubtract").val("");
    });

    $("#btnCreatePlayer").on("click", function(){
        
        //If the user deleted the data in #newPlayer before clicking the button,
        //show the #newPlayer tooltip and return
        if($("#newPlayer").val() === ""){
            $("#btnCreatePlayer").attr("disabled", "disabled");
            $("#newPlayer").tooltip("show");
            return;
        }
        
        //Create the new player object and add it to the newPlayer array
        var newPlayer = new Object();
        newPlayer.playerName = $("#newPlayer").val();
        newPlayer.dollars = 0;
        playerArray.push(newPlayer);
        $("#newPlayer").val("");
        
        var newPlayerListHtml = "";
        
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
                                  .removeAttr("disabled");
        }
        
        //Disable #btnCreatePlayer.  The keyup handler will enable it when valid data is input
        $("#btnCreatePlayer").attr("disabled", "disabled");
        
        $("#newPlayer").focus();
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
            if($("#checkboxBoardPlayer").is(":checked")){
                var newPlayer = new Object();
                newPlayer.playerName = $("#inputBoardPlayer").val();
                newPlayer.dollars = 0;
                playerArray.push(newPlayer);
            }
            
            //Store the defaultgame cookie with this setup if #defaultGameCheckbox was checked
            if($("#defaultGameCheckbox").is(":checked")){
                $.cookie("defaultgame", JSON.stringify(playerArray), {expires: 365});
                $("#defaultGameCheckbox").prop("checked", false);
            }
            
        } else {
            //If there is a cookie, put that data into playerArray
            playerArray = $.parseJSON($.cookie("playerdata"));
        };
        startGame();
    });

    function startGame(){
        
        //Fade out the game setup elements and when the fadeOut is complete, concatenate the HTML for #playerPanel
        $(".row").eq(0).fadeOut(1000, function(){
            
            var playerHtml = "";

            //Iterate through each player object in playerArray to build the associated HTML elements
            $.each(playerArray, function( index, value ) {
                
                //Concatenate the HTML for each player's controls
                dataPlayerName = " data-playername='" + value.playerName + "' "
                playerHtml += "<div class='playerDiv'" + dataPlayerName + "><div class='playerName'" + dataPlayerName + ">" + value.playerName + "</div>";
                playerHtml += ": $<input" + dataPlayerName + "class='playerDollars' disabled value='" + value.dollars + "'>";
                playerHtml += "</div>";
            });
            
            //Add all of the player controls to #playerPanel, and fade in #gamePanel
            $("#playerPanel").append(playerHtml);
            
            //Add the 'Delete Player' button
            $("#playerPanel").parent().after("<tr><td id='tdDeletePlayerButtonCell'><button id='btnDeletePlayer' type='button' class='btn btn-sm' data-toggle='modal' data-target='#modalDeletePlayerConfirm'>Delete Player</button></td></tr>");
            
            $("#gamePanel").fadeIn(1000);
            $("#activityLog").html("Game started!");
            
            //Set the first player as currentPlayer
            $(".playerDiv").eq(0).click();
            
        });
    }
    
    //Register the click event for the .bill DIVs
    //TODO: Use .isNumeric
    $(document).on("click", ".bill", function(){
        if(parseInt($("#dollarsAddSubtract").val())){
            //If there is already a number there, add the DIVs bill value to it
            $("#dollarsAddSubtract").val(parseInt($("#dollarsAddSubtract").val()) + parseInt($(this).data("bill")));
        }else{
            //If there was not alread a number there, set it to the DIV's bill value
            $("#dollarsAddSubtract").val(parseInt($(this).data("bill")));
        }
        //Trigger the keyup handler for #dollarsAddSubtract to disable the Add $ and Subtract $ buttons
        $("#dollarsAddSubtract").keyup();
    });
    
    //Register the keyup event for #dollarsAddSubtract
    $(document).on("keyup", "#dollarsAddSubtract", function(){
        if($.isNumeric($("#dollarsAddSubtract").val())){
            //If the element contains a valid number, enable the Add $ and Subtract $ buttons   
            $("#buttonAddMoney, #buttonSubtractMoney").removeAttr('disabled');
        } else {
            //If the element does not contain a valid number, disable the Add $ and Subtract $ buttons
            $("#buttonAddMoney, #buttonSubtractMoney").attr('disabled', 'disabled');
        }
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
                $("#newPlayer").tooltip("hide");
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
    
    function savePlayerData(){
        $.cookie("playerdata", JSON.stringify(playerArray), {expires: 365});
    }
    
    if($.cookie("playerdata")){
        $("#btnStartGame").trigger("click");
    }
    
    $("#buttonNewGameConfirm").on("click", function(){
        $.removeCookie("playerdata");
        location.reload();
    });
    
    $("body").on("click", ".playerDiv", function(){
        
        var playerFrom = currentPlayer;
        
        //Set the player that was clicked on to the current player
        currentPlayer = getPlayerObject($(this).data("playername"));
        //If the same player was clicked, do nothing
        if(currentPlayer === playerFrom) return;
        
        //Remove highligh from all players, then highlight the player that was clicked on 
        $(".playerDiv").children().addBack().css("background-color", "#FAFAFA").css("color", "#888888");
        $(this).children().addBack().css("background-color", "#86C98A").css("color", "white");

        //if there is a number in #dollarsAddSubtract, treat the action as a transfer
        if($.isNumeric($("#dollarsAddSubtract").val())){
            //show the modal for confirmation
            
            var amount = parseInt($("#dollarsAddSubtract").val());
            
            playerFrom.dollars = parseInt(playerFrom.dollars) - amount;
            currentPlayer.dollars = parseInt(currentPlayer.dollars) + amount;
            
            //Log the action and clear all .dollarsAddSubtract elements
            $("#activityLog").prepend("$" + amount + " from " + spanRedOpenTag + playerFrom.playerName
                      + spanCloseTag + " to " + spanGreenOpenTag + currentPlayer.playerName + spanCloseTag + "<br>");

            updatePlayerDollars();
        }
    });
 
    //Show the Start Default Game button if a default game is found
    if($.cookie("defaultgame")){
        $("#btnStartDefaultGame").removeClass("invisible");
        
        //Set the tooltip to show the default game players
        var defaultGameText = "";
        var defaultGameArray = $.parseJSON($.cookie("defaultgame"));
        
        for(var i=0; i<defaultGameArray.length;i++){
            defaultGameText += defaultGameArray[i].playerName + ": $" + defaultGameArray[i].dollars + "\n";
        }
        
        defaultGameText = defaultGameText.substr(0, defaultGameText.length - 2);
        $("#btnStartDefaultGame").prop("title", defaultGameText);
    }

    $("#btnStartDefaultGame").on("click", function (){
        playerArray = $.parseJSON($.cookie("defaultgame"));
        startGame();
        return false;
    });
    
    //Initialize tooltips
    $("body").tooltip({
        selector: '[data-toggle=tooltip]',
        placement: 'auto',
        trigger: 'hover',
        delay: { "show": 1000, "hide": 500 }
    });
    
    $("#checkboxBoardPlayer").on("change", function() {
        if($("#checkboxBoardPlayer").is(":checked")){
            $(".boardPlayerElement").removeClass("invisible");
        } else {
            $(".boardPlayerElement").addClass("invisible");
        }
    });

    $("#buttonDeletePlayerConfirm").on("click", function (){
        for(var i=0;i<playerArray.length;i++){
            if(playerArray[i].playerName === currentPlayer.playerName){
                break;
            }
        }
        playerArray.splice(i,1);
        $(".playerDiv[data-playername='" + currentPlayer.playerName + "']").remove()
        $(".playerDiv").eq(0).click();
        savePlayerData();
    });
    
    $("#modalDeletePlayerConfirm").on("shown.bs.modal", function (){
        $("#divDeletePlayerConfirmBody").html("Are you sure you want to delete " + currentPlayer.playerName + "?");
    });
    
    function updatePlayerDollars(){
        for(var i=0;i<playerArray.length;i++){
            $("input[data-playername='" + playerArray[i].playerName + "']").val(playerArray[i].dollars);           
        }
        //Clear #dollarsAddSubtract
        $("#dollarsAddSubtract").val("");

        //Trigger the keyup handler on #dollarsAddSubtract to disable Add $ and Subtract $ buttons
        $("#dollarsAddSubtract").keyup();
        
        //Save the game data to the cookie
        savePlayerData();
    }
})

var playerArray = new Array();
var currentPlayer;

function getPlayerObject(player){
   for(var i=0;i<playerArray.length;i++){
       if(playerArray[i].playerName === player){
           return playerArray[i];
       }
   }
}