var width = 8;
var height = 8;

var players = 2;

var cloth = ["res/red.png", "res/yellow.png"];
var startsWith = 12;
var amount = [startsWith, startsWith];

var grid = [];

var selected = undefined;

var placing = undefined;
var placingPlayer = 0;
var placingOrientation = 0;
var placingMirror = false;

// Direction to next cloth from current orientation
var clockwise = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1]
]
var counterclockwise = [
    [0, 1],
    [-1, 0],
    [0, -1],
    [1, 0]
]

function setCloth(x, y, player, n, orientation, mirror) {
    let right = orientation == 1 || orientation == 2;
    let bottom = orientation > 1;

    c = " class=\"cloth";
    if (right)
        c += " right"
    if (bottom)
        c += " bottom"
    c += "\"";

    let id = x + y * width;

    $(".nume" + id).html("<img src=\"" + cloth[player] + "\"" + c + "></img>");
    grid[id].unshift({ player: player, n: n, orientation: orientation, mirror: mirror });
}

function getNextOrientation(orientation, mirror) {
    let newOrientation = orientation + (mirror ? -1 : 1);

    if (newOrientation == -1)
        newOrientation = 3;
    if (newOrientation == 4)
        newOrientation = 0;

    return newOrientation;
}

function getCloth(x, y, player, n) {
    if (x < 0 || y < 0 || x >= width || y >= height)
        return undefined;

    let id = x + y * width;

    for (let i = 0; i < grid[id].length; i++) {
        if (grid[id][i].player === player && grid[id][i].n === n) {
            return grid[id][i];
        }
    }

    return undefined;
}

function getCloths(x, y) {
    let id = x + y * width;

    if (grid[id].length === 0) {
        return [];
    }

    let cloth = grid[id][0];
    let cloths = [id];

    let orientation = cloth.orientation;

    for (let i = 0; i < 3; i++) {
        let [xa, ya] = clockwise[orientation];

        x += xa;
        y += ya;

        let next = getCloth(x, y, cloth.player, cloth.n);
        if (next !== undefined) {
            cloths.push(x + y * width);
        }

        orientation++;
        if (orientation == 4) {
            orientation = 0;
        }
    }

    return cloths;
}

function isStuck(x, y) {
    let id = x + y * width;

    let cloth = grid[id][0];

    let orientation = cloth.orientation;

    for (let i = 0; i < 3; i++) {
        let [xa, ya] = clockwise[orientation];

        x += xa;
        y += ya;

        let next = getCloth(x, y, cloth.player, cloth.n);
        if (next !== undefined && grid[x + y * width][0] != next) {
            return true;
        }

        orientation++;
        if (orientation == 4) {
            orientation = 0;
        }
    }

    return false;
}

function unfoldCloth(x, y) {
    let id = x + y * width;
    let cloth = grid[id][0];

    let [xa, ya] = cloth.mirror ? counterclockwise[cloth.orientation] : clockwise[cloth.orientation];

    let nx = x + xa;
    let ny = y + ya;

    if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        // Out of bounds
        return false;
    }

    let newId = nx + ny * width;

    if (getCloth(nx, ny, cloth.player, cloth.n) !== undefined) {
        if (grid[newId][0].player !== cloth.player || grid[newId][0].n !== cloth.n) {
            // Next is stuck
            return false;
        }

        [xa, ya] = cloth.mirror ? clockwise[cloth.orientation] : counterclockwise[cloth.orientation];

        if (x + xa < 0 || y + ya < 0 || x + xa >= width || y + ya >= height) {
            // Out of bounds
            return false;
        }

        if (getCloth(x + xa, y + ya, cloth.player, cloth.n) !== undefined) {
            // Already fully folded
            return false;
        }

        let o0 = getNextOrientation(cloth.orientation, !cloth.mirror);
        let o1 = getNextOrientation(               o0, !cloth.mirror);

        setCloth( x + xa,  y + ya, cloth.player, cloth.n, o0, !cloth.mirror);
        setCloth(nx + xa, ny + ya, cloth.player, cloth.n, o1,  cloth.mirror);
    } else {
        setCloth(nx, ny, cloth.player, cloth.n, getNextOrientation(cloth.orientation, cloth.mirror), !cloth.mirror);
    }

    return true;
}

function refreshAmount(player) {
    $(".p" + player).html("<img src=\"" + cloth[player] + "\"></img> x " + amount[player]);

    if (amount[player] > 0) {
        $(".p" + player + " img").draggable({
            cursor: 'move',
            cursorAt: {
                top: 25,
                left: 25
            },
            containment: 'document',
            helper: function() {
                return "<div class=\"hover p" + player + "\"><img src=\"" + cloth[player] + "\"></img></div>";
            }
        });
    }
}

function drawArrow(x, y, xa, ya, rotate) {
    let id = x + y * width;

    let arrow = $("<div class=\"arrow\"><img class=\"rotate" + rotate + "\" src=\"res/arrow.png\"></img></div>");

    $(".nume").append(arrow);

    let p0 = arrow.position();
    let p1 = $(".nume" + id).position();

    let px = 1 + xa * 26;
    let py = 1 + ya * 26;

    arrow.css("top", p1.top - p0.top + py);
    arrow.css("left", p1.left - p0.left + px);
}

function drawArrows(cloths) {
    let id = cloths[0];
    let cloth = grid[id][0];

    let x = id % width;
    let y = Math.floor(id / width);

    let [xa, ya] = cloth.mirror ? counterclockwise[cloth.orientation] : clockwise[cloth.orientation];

    if (cloths.length == 1) {
        let dir = cloth.orientation + 3;
        if (cloth.mirror) {
            dir += 1;
        }
        dir %= 4;

        drawArrow(x, y, xa, ya, dir * 90);
    } else {
        let [xo, yo] = cloth.mirror ? clockwise[cloth.orientation] : counterclockwise[cloth.orientation];

        let xn = x + xa;
        let yn = y + ya;

        let dir = cloth.orientation + 3;
        if (!cloth.mirror) {
            dir += 1;
        }
        dir %= 4;

        drawArrow( x,  y, xo, yo, dir * 90);
        drawArrow(xn, yn, xo, yo, dir * 90);
    }
}

$(document).ready(() => {
    $(".nume").css("width", 50 * width + "px");
    $(".amount").css("width", 50 * width + "px");

    for (let player = 0; player < players; player++) {
        $(".amount").append("<div class=\"col p" + player + "\"></div>");
        refreshAmount(player);

        $(".p" + player + " img").mousedown(function() {
            if (selected !== undefined) {
                // Reset opacity of all cloths
                $(".cloth").css("opacity", 1);
                selected = undefined;
            }
        })
    }

    let html = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // New grid cell
            let id = x + y * width;
            html += "<div class=\"col nume" + id + "\"></div>";

            grid.push([]);
        }

        // New row
        html += "<div class=\"w-100\"></div>"
    }

    $(".nume .row").html(html);

    $(".nume .col").mouseleave(function() {
        if (selected === undefined) {
            // Reset opacity of all cloths
            $(".cloth").css("opacity", 1);
        }
    });

    $(document).mousedown(function(e) {
        if (placing !== undefined) {
            placing = undefined;
            $(".placing").remove();

            if (!$(e.target).is("img")) {
                $(".arrow").remove();
            }
        }
        if (selected !== undefined && !$(e.target).is("img")) {
            // Reset opacity of all cloths
            $(".cloth").css("opacity", 1);
            $(".arrow").remove();
            selected = undefined;
        }
    }).mousewheel(function(e) {
        if (placing !== undefined) {
            if (e.originalEvent.wheelDelta > 0) {
                if (!placingMirror) {
                    placingMirror = true;
                } else {
                    placingMirror = false;
                    placingOrientation++;
                    if (placingOrientation == 4) {
                        placingOrientation = 0;
                    }
                }
            } else {
                if (placingMirror) {
                    placingMirror = false;
                } else {
                    placingMirror = true;
                    placingOrientation--;
                    if (placingOrientation == -1) {
                        placingOrientation = 3;
                    }
                }
            }

            c = "placing";
            if (placingOrientation == 1 || placingOrientation == 2)
                c += " right"
            if (placingOrientation > 1)
                c += " bottom"

            $(".placing").attr("class", c);
            $(".arrow").remove();

            let x = placing % width;
            let y = Math.floor(placing / width);

            let [xa, ya] = placingMirror ? counterclockwise[placingOrientation] : clockwise[placingOrientation];

            let dir = placingOrientation + 3;
            if (placingMirror) {
                dir += 1;
            }
            dir %= 4;

            drawArrow(x, y, xa, ya, dir * 90);
        }
    });

    $(".nume .col").mouseenter(function() {
        if (selected === undefined) {
            // Reset opacity of all cloths
            $(".cloth").css("opacity", 1);

            let sid = $(this).attr("class").split(" ")[1];
            let id = parseInt(sid.substr(4));

            let x = id % width;
            let y = Math.floor(id / width);

            let cloths = getCloths(x, y);

            for (let i = 0; i < cloths.length; i++) {
                // Set opacity of selected cloths
                $(".nume" + cloths[i] + " .cloth").css("opacity", 0.5);
            }
        }
    }).mousedown(function() {
        let sid = $(this).attr("class").split(" ")[1];
        let id = parseInt(sid.substr(4));

        let x = id % width;
        let y = Math.floor(id / width);

        if (placing === id) {
            amount[placingPlayer]--;

            setCloth(x, y, placingPlayer, amount[placingPlayer], placingOrientation, placingMirror);
            justplaced = true;

            refreshAmount(placingPlayer);
            $(".arrow").remove();
        } else if (selected !== id) {
            $(".arrow").remove();
            selected = id;

            // Reset opacity of all cloths
            $(".cloth").css("opacity", 1);

            let cloths = getCloths(x, y);
            if (cloths.length === 0 || cloths.length === 4 || isStuck(x, y)) {
                selected = undefined;
            } else {
                for (let i = 0; i < cloths.length; i++) {
                    // Set opacity of selected cloths
                    $(".nume" + cloths[i] + " .cloth").css("opacity", 0.5);
                }

                drawArrows(cloths);
            }
        } else {
            unfoldCloth(x, y);

            $(".arrow").remove();
            selected = undefined;

            let cloths = getCloths(x, y);
            for (let i = 0; i < cloths.length; i++) {
                // Set opacity of selected cloths
                $(".nume" + cloths[i] + " .cloth").css("opacity", 0.5);
            }
        }
    }).droppable({
        drop: function(e, ui) {
            let sid = $(this).attr("class").split(" ")[1];
            let id = parseInt(sid.substr(4));

            let x = id % width;
            let y = Math.floor(id / width);

            let split = ui.helper.attr("class").split(" ")

            let splayer = split[1];
            let player = parseInt(splayer.substr(1));

            if (grid[id].length === 0) {
                placing = id;
                placingPlayer = player;
                placingOrientation = 0;
                placingMirror = false;

                $(".nume" + id).prepend("<img src=\"" + cloth[player] + "\" class=\"placing\"></img>");
                $(".placing").css("opacity", 0.5);

                let [xa, ya] = clockwise[0];
                drawArrow(x, y, xa, ya, 270);
            }

            refreshAmount(player);
        }
    });

});
