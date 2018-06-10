/**
 * Updates the turn indicator text
 */
function updateTurnIndicator() {
    let turnIndicator = document.getElementById("turnIndicator");
    turnIndicator.innerText = turns + "/" + maxTurns;
}

/**
 * Generates the "You won" toast
 */
function announceWin() {
    let content = '<span>You won after ' + turns + ' turns!</span><button class="btn-flat toast-action" onclick="newGame()">New game</button>'
    M.toast({
        html: content
    });
}

/**
 * Generates the "You lost" toast
 */
function announceLoss() {
    let content = '<span>You lost! | || || |_</span><button class="btn-flat toast-action" onclick="newGame()">New game</button>'
    M.toast({
        html: content
    });
}