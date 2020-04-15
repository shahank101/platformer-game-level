let game, controller, display;
let assets_manager;


const AssetsManager = function() {

  this.tilesheet_image = undefined;

}

AssetsManager.prototype = {

 //sa constructor : Game.AssetsManager,

  requestJSON: function(url, callback) {

    let request = new XMLHttpRequest();

    request.addEventListener("load", function(event) {

      callback(JSON.parse(this.responseText));

    }, { once: true });

    request.open("GET", url);
    request.send();
      
  },

}







function setup() {

  game = new Game();
  display = new Display();
  assets_manager = new AssetsManager();


  display.canvas.width = game.world.width;
  display.canvas.height = game.world.height;

  assets_manager.requestJSON("assets/cave" + game.world.zone_id + ".json", (zone) => {

    game.world.setup(zone);

  });

  display.renderDisplay();

}

function draw() { // render() function

  background(0);

  /////// START FROM HERE /////////

  display.drawMap(game.world.map, game.world.rows, game.world.columns, game.world.tile_size, game.world.bordersOn);
  display.drawPlayer(game.world.player, game.world.player.color);
  
  





  /////// NO NEED TO TOUCH ////////
  
 

  if (keyIsDown(LEFT_ARROW)) {  
    game.world.player.moveLeft();   
  };

  if (keyIsDown(RIGHT_ARROW)) {
    game.world.player.moveRight()  
  };

  if (keyIsDown(UP_ARROW)) {
      game.world.player.jump() 
  };

  game.update();



}
