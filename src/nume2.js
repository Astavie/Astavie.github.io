const width = 8;
const height = 8;

const players = 2;

const cloth = ["res/red.png", "res/yellow.png"];
const startsWith = 12;

var amount = Array(players).fill(startsWith);

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

        const imgstack = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        imgstack.attr('class', 'imgstack');
        imgstack.append(img);

        const stack = $(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
        stack.attr('class', 'stack');
        stack.append(imgstack);
        stack.append(text);

        stack.draggable({
            revert: 'invalid',
            cursor: 'move',
            containment: "body",
            appendTo: "body",
            helper: function() {
                return '<img class="svg-text" src="' + cloth[player] + '" width="' + img.getBoundingClientRect().width + '" height="' + img.getBoundingClientRect().height + '"></img>';
            },
            start: function(_event, ui) {
                ui.helper.data('dropped', false);
                amount[player] -= 1;
                text.html(amount[player]);
            },
            stop: function(_event, ui) {
                if (!ui.helper.data('dropped')) {
                    amount[player] += 1;
                    text.html(amount[player]);
                }
            }
        });

        $("#table-svg-stacks").append(stack);
    }

    // Set svg size
    $("#table-svg").attr("viewBox", "0 0 " + (viewport_width) + " " + (viewport_height + posh * 2 + 4));

});
