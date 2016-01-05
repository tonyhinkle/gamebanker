$(document).ready(function ($) {
    
    var playerArray = new Array();
    $("#newPlayer").focus();
    
    $('body').tooltip({
        selector: '[data-toggle=tooltip]',
        placement: 'auto',
        trigger: 'hover'
    });
    
    var lastInput = "";
    
    //Register the click event for the buttons to add and subtract money
    $(document).on("click", ".buttonAddMoney, .buttonSubtractMoney, .buttonAdd200", function(){
        var playerAmount = $(this).prevAll(".playerDollars");
        var amountChange;
        var operation = "+";
        
        if ($(this).hasClass("buttonAdd200")){
            amountChange = 200;
        }
        else{
            amountChange = parseInt($(this).prevAll(".draggable").children(".dollarsAddSubtract").val());
        }
        
        if ($(this).hasClass("buttonSubtractMoney")){
            amountChange = -amountChange
             operation = "-";
        }
        
        playerAmount.val(parseInt(playerAmount.val()) + parseInt(amountChange));
        $(this).prevAll(".draggable").children(".dollarsAddSubtract").val("");
        
        $(lastInput).keyup();
        $("#activityLog").prepend($(this).parent().children(".playerName").data("playername") + ": " +operation + "$" + Math.abs(amountChange) + "<br>");
    });
    
    $(document).on("click", ".buttonClear", function(){
        $(this).prevAll(".draggable").children(".dollarsAddSubtract").val("");
        $(lastInput).keyup();
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
                
                playerHtml += "<div class='playerDiv'><div class='playerName droppable' data-playername='" + value.playerName + "'>" + value.playerName + "</div>";
                playerHtml += ": $<input class='playerDollars' disabled value='" + startingAmount + "'>";
                playerHtml += "<div class='draggable'><input class='dollarsAddSubtract' data-toggle='tooltip' title='Drag to another player&#39;s name to transfer money.'></div><br>";
                playerHtml += "<button type='button' class='btn btn-xs buttonClear'>Clear</button>";
                playerHtml += "<button type='button' class='btn btn-sm buttonAddMoney' disabled='disabled'>Add $</button>";
                playerHtml += "<button type='button' class='btn btn-sm buttonSubtractMoney' disabled='disabled'>Subtract $</button>";
                playerHtml += "<button type='button' class='btn btn-sm buttonAdd200'>Add $200</button>";
                playerHtml += "</div>";
            });
            
            $("#playerPanel").html(playerHtml);
            $("#gamePanel").fadeIn(1000);
            $("#activityLog").html("Game started!")
            
            $(".draggable").draggable({
                start: function (event, ui) {
                    $(this).data('preventBehaviour', true);
                },
                revert : true
            });
            
            $(".draggable").find(":input").on('mousedown', function (e) {
                var mdown = new MouseEvent("mousedown", {
                screenX: e.screenX,
                screenY: e.screenY,
                clientX: e.clientX,
                clientY: e.clientY,
                view: window
            });
    
            $(this).closest('.draggable')[0].dispatchEvent(mdown);
            }).on('click', function (e) {
                var $draggable = $(this).closest('.draggable');
                if ($draggable.data("preventBehaviour")) {
                    e.preventDefault();
                    $draggable.data("preventBehaviour", false)
                }
            });
            
            $( ".droppable" ).droppable({
                drop: function( event, ui ) {
                
                    var amount = parseInt(event.toElement.value);
                    
                    if($.isNumeric(amount)){
                
                        $(this).nextAll("input").val(parseInt($(this).nextAll("input").val()) + amount);
                        $(ui.draggable).prev().val(parseInt($(ui.draggable).prev().val()) - amount);
                    
                        $("#activityLog").prepend("$" + amount + " from " + $(ui.draggable).prevAll('.playerName').data("playername") + " to " + $(this).data("playername") + "<br>");
                        $(".dollarsAddSubtract").val("");
                        $(lastInput).keyup();
                    }
                }
            });
        });
    });
    
    $(document).on("focus", ".dollarsAddSubtract", function(){
        lastInput = this;
    });
    
    $(document).on("click", ".bill", function(){
        if(parseInt($(lastInput).val())){
           $(lastInput).val(parseInt($(lastInput).val()) + parseInt($(this).data("bill")));
        }else{
            $(lastInput).val(parseInt($(this).data("bill")));
        }
        $(lastInput).keyup();
    });
    
    $(document).on("keyup", ".dollarsAddSubtract", function(){
        if($.isNumeric($(lastInput).val())){
           $(this).parent().nextAll('button').slice(1,3).removeAttr('disabled');
        } else {
            $(this).parent().nextAll('button').slice(1,3).attr('disabled', 'disabled');
        }
    });
    $(document).on("mouseout", ".dollarsAddSubtract", function(){
        $('.tooltip').hide();
        console.log('hi')
    });
})