const width = 8;
const height = 8;

const players = 2;

const cloth = ["res/red.png", "res/yellow.png"];
const startsWith = 12;

var amount = Array(players).fill(startsWith);

// Fix jquery
$.ui.intersect_o = $.ui.intersect;
$.ui.intersect = function (draggable, droppable, toleranceMode, event) {
    if (droppable.proportions && !droppable.proportions().width && !droppable.proportions().height) {
        if (typeof $(droppable.element).get(0).getBoundingClientRect === "function") {
            droppable.proportionsBBox = droppable.proportionsBBox || $(droppable.element).get(0).getBoundingClientRect();
            droppable.proportions = function () {
                return droppable.proportionsBBox;
            };
        }
    }

    return $.ui.intersect_o(draggable, droppable, toleranceMode, event);
};

$(document).ready(() => {

    // Render table
    let html = "";

    const offset = 4;
    const viewport_width = (100 - offset * 2) * (width / height) + offset * 2;
    const viewport_height = 100;

    const posw = (viewport_width - offset * 2) / width;
    const posh = (viewport_height - offset * 2) / height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const posx = x * posw + offset;
            const posy = y * posh + offset;

            // const id = x + y * width;
            html += '<rect x="' + posx + '" y = "' + posy + '" width="' + posw + '" height="' + posh + '"/>';
        }
    }
    $("#table-svg-background").html('<rect x="0.5" y="0.5" width="' + (viewport_width - 1) + '" height="' + (viewport_height - 1) + '">');
    $("#table-svg-grid").html(html);

    // Render Stacks
    for (let player = 0; player < players; player++) {
        // https://stackoverflow.com/questions/10236006/adding-image-to-svg-file-using-javascript-and-jquery
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttributeNS(null, 'height', posh * 2);
        img.setAttributeNS(null, 'width', posw * 2);
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', cloth[player]);
        img.setAttributeNS(null, 'x', (posw * 2 + 2) * player);
        img.setAttributeNS(null, 'y', 102);

        const text = $(document.createElementNS('http://www.w3.org/2000/svg', 'text'));
        text.attr('x', (posw * 2 + 2) * player + posw * 2 - 0.5);
        text.attr('y', 102 + posh * 2 - 0.5);
        text.attr('font-size', 8);
        text.attr('font-weight', 'bold');
        text.attr('font-family', 'sans');
        text.attr('text-anchor', 'end');
        text.attr('stroke', "#FFFFFF");
        text.attr('stroke-width', 0.3);
        text.attr('class', 'svg-text');
        text.html(amount[player]);

        const stack = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        stack.attr('class', 'stack');
        stack.append(img);
        stack.append(text);

        stack.draggable({
            cursor: 'move',
            containment: "body",
            appendTo: "body",
            helper: function () {
                return '<img class="svg-text" src="' + cloth[player] + '" width="' + img.getBoundingClientRect().width + '" height="' + img.getBoundingClientRect().height + '"></img>';
            },
            start: function (_event, ui) {
                // Keep track if the cloth has been dropped
                ui.helper.data('dropped', false);

                // Remove cloth from the stack
                amount[player] -= 1;
                text.html(amount[player]);

                // Disable dragging if there are no more left in the stack
                if (amount[player] <= 0) {
                    stack.addClass("empty");
                    stack.draggable('disable');
                }
            },
            stop: function (_event, ui) {
                if (!ui.helper.data('dropped')) {
                    // Cloth was reverted, add it back to the stack
                    amount[player] += 1;
                    text.html(amount[player]);

                    // Enable dragging again
                    if (amount[player] >= 1) {
                        stack.removeClass("empty");
                        stack.draggable('enable');
                    }
                }
            }
        });

        $("#table-svg-stacks").append(stack);
    }

    // Set svg size
    $("#table-svg").attr("viewBox", "0 0 " + (viewport_width) + " " + (viewport_height + posh * 2 + 4));

    // Droppable
    $("#table-svg-grid").droppable({
        accept: "*",
        tolerance: "pointer",
        drop: function (_event, ui) {
            // Something
            ui.helper.data('dropped', true);
            console.log("dropped");
        }
    });

});

// IDK WHY THIS WORKS BUT IT MAKES MOBILE NOT FUCK UP SO DON'T REMOVE
document.addEventListener("touchmove", function () { });
