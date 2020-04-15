const Display = function() {

    this.canvas = {
        width: 0,
        height: 0
    }


    this.renderDisplay = function() {

        createCanvas(this.canvas.width, this.canvas.height);

    }

    this.drawMap = function(map, rows, columns, tile_size, bordersOn = false) { 

        for (let index = map.length - 1; index > -1; --index) {

            let value = map[index];
            let col;

            switch(value) {

                case 0: 
                    col = color(71, 39.5, 11);  
                    break;

                case 1: col = color(21)  ;  break;

                case 2: col = color(0, 200, 0);  break;

            }

            fill(col);

            if (bordersOn) {
                stroke(200);
            } else {
                noStroke();
            }

            let destination_x = (index % columns) * tile_size;
            let destination_y = Math.floor(index / columns) * tile_size;
            rect(destination_x, destination_y, tile_size, tile_size);

        }

    };

    this.drawPlayer = function(rectangle, color) {

        fill(color);
        noStroke();
        rect(Math.round(rectangle.x), Math.round(rectangle.y), rectangle.width, rectangle.height);

    };

};