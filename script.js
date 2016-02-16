$(document).ready(function ($) {
    
    //Create global variables
    var spanGreenOpenTag = "<span class='colorGreen'>+";
    var spanRedOpenTag = "<span class='colorRed'>-";
    var spanCloseTag = "</span>";
    
    //Prepare UI elements
    $("#newPlayer").focus();
    $("#checkboxBoardPlayer, #defaultGameCheckbox").prop( "checked", false );
    
    //Register the click event for the buttons to add and subtract money
    $(document).on("click", "#buttonAddMoney, #buttonSubtractMoney, #buttonAdd200", function(){
        
        //Get the player's current amount of money, and initialize some other variables
        var amountChange = 0;
        var opColorOpenTag = spanGreenOpenTag;

        //If the "Add $200" button was clicked, set amountChanged to 200
        if ($(this).attr("id") == "buttonAdd200"){
            amountChange = 200;
        }
        else{
            //If an Add $ or Subtract $ button was clicked, set amountChanged to the appropriate input value
            amountChange = parseInt($("#dollarsAddSubtract").val());
            
            //If Subtract $ was clicked, change it to a negative number and swap the opColorOpenTag
            if ($(this).attr("id") == "buttonSubtractMoney"){
                amountChange = -amountChange
                opColorOpenTag = spanRedOpenTag;
            }
        }
        
        //Add amountChange to the player's current amount of $
        currentPlayer.dollarsAddSubtract(parseInt(amountChange))
        
        //Add the transaction to the activity log
        $("#activityLog").prepend(currentPlayer.playerName + ": " + opColorOpenTag
                 + "$" + Math.abs(amountChange) + spanCloseTag + "<br>");
    });
    
    //Register the click event for the "Clear" buttons
    $(document).on("click", "#buttonClear", function(){
        //Clear the current text input and trigger the keyup handler to disable the Add $ and Subtract $ buttons
        $("#dollarsAddSubtract").val("").keyup();
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
        var newPlayer = new player($("#newPlayer").val(), 0);
        
        //Build the list of players
        var newPlayerListHtml = "";
        
        $.each(playerArray, function( index, value ) {
            newPlayerListHtml += value.playerName + "<br>";
        });
        
        //Show the list of players in the #newPlayerList DIV
        $("#newPlayerList").html(newPlayerListHtml);
        
        //If it is the second player to be added, show the .startGameElement elements
        if(playerArray.length == 2){
            $(".startGameElement").removeClass("invisible").hide().fadeIn(800).removeAttr("disabled");
        }
        
        //Disable #btnCreatePlayer.  The keyup handler will enable it when valid data is input
        $("#btnCreatePlayer").attr("disabled", "disabled");
        $("#newPlayer").focus();
        return false;
    });
    
    //Register the click handler for #btnStartGame
    $("#btnStartGame").on("click", function(){
        
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
            playerArray[i].dollars = parseInt($("#startingAmount").val());
        }

        //Create the "Board" player to track "Free Parking"  money
        if($("#checkboxBoardPlayer").is(":checked")){
            var newPlayer = new player($("#inputBoardPlayer").val(), 0);
        }

        //Store the defaultgame cookie with this setup if #defaultGameCheckbox was checked
        if($("#defaultGameCheckbox").is(":checked")){
            $.cookie("defaultgame", JSON.stringify(playerArray), {expires: 365});
            $("#defaultGameCheckbox").prop("checked", false);
        }
    
        startGame();
    });
    
    function playerDataFromCookie(c){
        var tempArray = [];
        tempArray = $.parseJSON($.cookie(c));

        for(var i=0;i<tempArray.length;i++){
            var p = new player(tempArray[i].playerName, tempArray[i].dollars);
        }
        startGame();
    }

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
        if($.isNumeric($("#dollarsAddSubtract").val())){
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
            $("#btnStartGame").removeAttr("disabled").css("opacity", "1");
        }else{
            //If #startingAmount does not contain a number, disable the start button and make it half opaque
            $("#btnStartGame").attr("disabled", "disabled").css("opacity", ".5");
        }
    });
    
    function savePlayerData(){
        $.cookie("playerdata", JSON.stringify(playerArray), {expires: 365});
    }
    
    if($.cookie("playerdata")){
        playerDataFromCookie("playerdata");
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
        
        //Remove highlight from all players, then highlight the player that was clicked on 
        $(".playerDiv").children().addBack().css("background-color", "#FAFAFA").css("color", "#888888");
        $(this).children().addBack().css("background-color", "#86C98A").css("color", "white");

        //if there is a number in #dollarsAddSubtract, treat the action as a transfer
        if($.isNumeric($("#dollarsAddSubtract").val())){
            
            var amount = parseInt($("#dollarsAddSubtract").val());
            
            playerFrom.dollarsAddSubtract(-amount);
            currentPlayer.dollarsAddSubtract(amount);
            
            //Log the action and clear all .dollarsAddSubtract elements
            $("#activityLog").prepend("$" + amount + " from " + spanRedOpenTag + playerFrom.playerName
                      + spanCloseTag + " to " + spanGreenOpenTag + currentPlayer.playerName + spanCloseTag + "<br>");

        }
    });
 
    //Show the Start Default Game button if a default game is found
    if($.cookie("defaultgame")){
        $("#btnStartDefaultGame").removeClass("invisible");
        
        //Set the tooltip to show the default game players
        var defaultGameText = "Default game is:\n";
        var defaultGameArray = $.parseJSON($.cookie("defaultgame"));
        
        for(var i=0; i<defaultGameArray.length;i++){
            defaultGameText += defaultGameArray[i].playerName + ": $" + defaultGameArray[i].dollars + "\n";
        }
        
        defaultGameText = defaultGameText.substr(0, defaultGameText.length - 2);
        $("#btnStartDefaultGame").prop("title", defaultGameText);
    }

    $("#btnStartDefaultGame").on("click", function (){
        playerArray = [];
        playerDataFromCookie("defaultgame");
        return false;
    });
    
    //Initialize tooltips
    $("body").tooltip({
        selector: '[data-toggle=tooltip]',
        placement: 'auto',
        trigger: 'hover',
        delay: { "show": 1000, "hide": 500 }
    });
    
    // Show/hide .boardPlayerElement based on #checkboxBoardPlayer state
    $("#checkboxBoardPlayer").on("change", function() {
        if($("#checkboxBoardPlayer").is(":checked")){
            $(".boardPlayerElement").removeClass("invisible");
        } else {
            $(".boardPlayerElement").addClass("invisible");
        }
    });

    //Regsiter the handler for the Delete Player button
    $("#buttonDeletePlayerConfirm").on("click", function (){
        // Find the index of the player object in the playerArray
        for(var i=0;i<playerArray.length;i++){
            if(playerArray[i].playerName === currentPlayer.playerName){
                break;
            }
        }
        // Delete the object out of he array, and remove the player's UI elements
        playerArray.splice(i,1);
        $(".playerDiv[data-playername='" + currentPlayer.playerName + "']").remove()
        $(".playerDiv").eq(0).click();
        savePlayerData();
    });
    
    // Add the text to the modal for player delete confirmation
    $("#modalDeletePlayerConfirm").on("shown.bs.modal", function (){
        $("#divDeletePlayerConfirmBody").html("Are you sure you want to delete " + currentPlayer.playerName + "?");
    });
    
    // Add/subtract to/from a player's dollars 
    function updatePlayerDollars(){
        
        //Loop through the player objects in the array and update all of them
        for(var i=0;i<playerArray.length;i++){
            $("input[data-playername='" + playerArray[i].playerName + "']").val(playerArray[i].dollars);           
        }
        //Clear #dollarsAddSubtract and trigger the keyup handler disable Add $ and Subtract $ buttons
        $("#dollarsAddSubtract").val("").keyup();
        
        //Save the game data to the cookie
        savePlayerData();
    }

    // Define the player object
    function player(name, dol) {
        this.playerName = name;
        this.dollars = dol;
        this.dollarsAddSubtract = function(val){
            this.dollars = parseInt(this.dollars) + parseInt(val);
            updatePlayerDollars();
        }
        // Add the object to playerArray and clear the #newPlayer input
        playerArray.push(this);
        $("#newPlayer").val("");
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