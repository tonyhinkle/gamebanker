$(document).ready(function ($) {
    
    var playerArray = new Array();
    $("#newPlayer").focus();
    
    //Register the click event for the buttons to add and subtract money
    $(document).on("click", ".buttonAddMoney, .buttonSubtractMoney, .buttonAdd200", function(){
        
        var playerAmount = $(this).prevAll(".playerDollars");
        var amountChange 
        
        if ($(this).hasClass("buttonAdd200")){
            amountChange = 200;
        }
        else{
            amountChange = parseInt($(this).prevAll(".dollarsAddSubtract").val());
        }
        
        if ($(this).hasClass("buttonSubtractMoney")){
            amountChange = -amountChange
        }
        
        playerAmount.val(parseInt(playerAmount.val()) + parseInt(amountChange));
        $(this).prevAll(".dollarsAddSubtract").val("");
    });
    
    $("#btnCreatePlayer").on("click", function(){
        
        var newPlayer = new Object();
        newPlayer.playerName = $("#newPlayer").val();
        newPlayer.dollars = 1650;
        playerArray.push(newPlayer);
        $("#newPlayer").val("")
        
        var newPlayerListHtml = ""
        
        $.each(playerArray, function( index, value ) {
            
            newPlayerListHtml += value.playerName + ": $" + value.dollars + "<br>";
        });
        
        $("#newPlayerList").html(newPlayerListHtml);
        
        return false;
    });
    
    $("#btnStartGame").on("click", function(){
        
        //Create the Success Club player to track money in the middle
        var newPlayer = new Object();
        newPlayer.playerName = "Success Club";
        newPlayer.dollars = 0;
        playerArray.push(newPlayer);

        $("#newPlayerDiv, #newPlayerList").fadeOut(20, function(){
            
            var playerHtml = "" 
            
            $.each(playerArray, function( index, value ) {

                playerHtml += "<div class='playerDiv'>" + value.playerName;
                playerHtml += ": $<input class='playerDollars' disabled value='" + value.dollars + "'>";
                playerHtml += "<input class='dollarsAddSubtract'>";
                playerHtml += "<button type='button' class='btn btn-xs buttonAddMoney'>Add $</button>";
                playerHtml += "<button type='button' class='btn btn-xs buttonSubtractMoney'>Subtract $</button>";
                playerHtml += "<button type='button' class='btn btn-xs buttonAdd200'>Add $200</button>";
                playerHtml += "</div>";
            });
            
            $("#gamePanel").html(playerHtml);
            $("#gamePanel").fadeIn(10);

        });
    });
})