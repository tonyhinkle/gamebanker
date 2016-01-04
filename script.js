$(document).ready(function ($) {
    
    var playerArray = new Array();
    $("#newPlayer").focus();
    
    var lastInput = "";
    
    
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
        newPlayer.dollars = "0";
        playerArray.push(newPlayer);
        $("#newPlayer").val("")
        
        var newPlayerListHtml = ""
        
        $.each(playerArray, function( index, value ) {
            
            newPlayerListHtml += value.playerName + "<br>";
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

        $("#newPlayerDiv, #newPlayerList").fadeOut(1000, function(){
            
            var playerHtml = "";
            var startingAmount;
            
            $.each(playerArray, function( index, value ) {
                
                if(index == playerArray.length -1){
                    startingAmount = 0;
                }else{
                    startingAmount = $("#startingAmount").val();
                }
                
                playerHtml += "<div class='playerDiv'>" + value.playerName;
                playerHtml += ": $<input class='playerDollars' disabled value='" + startingAmount + "'>";
                playerHtml += "<input class='dollarsAddSubtract'>";
                playerHtml += "<button type='button' class='btn btn-xs buttonAddMoney'>Add $</button>";
                playerHtml += "<button type='button' class='btn btn-xs buttonSubtractMoney'>Subtract $</button>";
                playerHtml += "<button type='button' class='btn btn-xs buttonAdd200'>Add $200</button>";
                playerHtml += "</div>";
            });
            
            $("#playerPanel").html(playerHtml);
            $("#gamePanel").fadeIn(1000);

        });
    });
    
    $(document).on("focus", ".dollarsAddSubtract", function(){
        
        lastInput = this;
        console.log(lastInput);
    
    });
    
    $(document).on("click", ".bill", function(){
        console.log($(lastInput).val());
        if(parseInt($(lastInput).val())){
           $(lastInput).val(parseInt($(lastInput).val()) + parseInt($(this).data("bill")));
        }else{
            $(lastInput).val(parseInt($(this).data("bill")));
        }
    });

})