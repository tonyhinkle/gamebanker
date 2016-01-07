$(document).ready(function ($) {
    
    var playerArray = new Array();
    var spanGreenOpenTag = "<span class='colorGreen'>";
    var spanRedOpenTag = "<span class='colorRed'>";
    var spanCloseTag = "</span>";

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
        var opColorOpenTag = spanGreenOpenTag;
        
        if ($(this).hasClass("buttonAdd200")){
            amountChange = 200;
        }
        else{
            amountChange = parseInt($(this).prevAll(".draggable").children(".dollarsAddSubtract").val());
        }
        
        if ($(this).hasClass("buttonSubtractMoney")){
            amountChange = -amountChange
            operation = "-";
            opColorOpenTag = spanRedOpenTag;
        }
        
        playerAmount.val(parseInt(playerAmount.val()) + parseInt(amountChange));
        $(this).prevAll(".draggable").children(".dollarsAddSubtract").val("");
        
        $(lastInput).keyup();
        $("#activityLog").prepend($(this).parent().children(".playerName").data("playername") + ": " + opColorOpenTag + operation + "$" + Math.abs(amountChange) + spanCloseTag + "<br>");
    });
    
    $(document).on("click", ".buttonClear", function(){
        $(this).prevAll(".draggable").children(".dollarsAddSubtract").val("");
        $(lastInput).keyup();
    });

    $("#btnCreatePlayer").on("click", function(){
        
        if($("#newPlayer").val() == ""){
            $("#btnCreatePlayer").attr("disabled", "disabled");
            $("#newPlayer").tooltip("show");
            return
        }
        
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
        
        if(playerArray.length == 2){
            $(".startGameElement").css("opacity", "1");
            $(".startGameElement").hide();
            $(".startGameElement").fadeIn(1000);
            $("#btnStartGame, #startingAmount").removeAttr("disabled");
            $("#startingAmount").tooltip("enable");
        }
        
        $("#btnCreatePlayer").attr("disabled", "disabled");
        
        return false;
    });
    
    $("#btnStartGame").on("click", function(){
        
        if(!$.isNumeric($("#startingAmount").val())){
            $("#startingAmount").tooltip("show");
            $("#btnStartGame").attr("disabled", "disabled");
            $("#btnStartGame").css("opacity", ".5")
            return;
        }
        
        //Create the Success Club player to track money in the middle
        var newPlayer = new Object();
        newPlayer.playerName = "Board";
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
                playerHtml += "<div class='draggable'><input class='dollarsAddSubtract' data-toggle='tooltip' "
                playerHtml += "title='Drag to another player&#39;s name to transfer money.'></div><br>";
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
                    
                        $("#activityLog").prepend("$" + amount + " from " + spanRedOpenTag + $(ui.draggable).prevAll('.playerName').data("playername") + spanCloseTag + " to " + spanGreenOpenTag + $(this).data("playername") + spanCloseTag + "<br>");
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
    });
    
    $("#newPlayer").on("keyup", function(){
        if($("#newPlayer").val() != ""){
            if(lookup(playerArray, "playerName", $("#newPlayer").val())){
                $("#btnCreatePlayer").attr("disabled", "disabled");
                $("#newPlayer").tooltip("show");
            } else {
                $("#btnCreatePlayer").removeAttr("disabled");
            }
        }else{
            $("#btnCreatePlayer").attr("disabled", "disabled");
        }
    });
    
    $("#startingAmount").on("keyup", function(){
        if($.isNumeric($("#startingAmount").val())){
            $("#btnStartGame").removeAttr("disabled");
            $("#btnStartGame").css("opacity", "1")
        }else{
            $("#btnStartGame").attr("disabled", "disabled");
            $("#btnStartGame").css("opacity", ".5")
        }
    });
    
    $("#startingAmount").tooltip("disable");
    
    $("#btnDisableTooltips").on("click", function(){
        $('[data-toggle=tooltip]').tooltip("disable");
        $("#btnDisableTooltips").hide();
    });
})

function lookup(array, prop, value) {
    console.log
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i][prop] === value) return array[i];
}