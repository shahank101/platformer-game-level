const Game = function() {

    this.world = new Game.World();


    this.update = function() {
        this.world.update();
    }

};

Game.prototype = { constructor : Game}; // another keyword for Game.prototype, don't sweat

Game.World = function(friction = 0.9, gravity = 3) {

    this.friction = friction;
    this.gravity = gravity;

    this.collider = new Game.World.Collider();

    this.player = new Game.World.Player();

    ///// MAP STUFF /////

    this.bordersOn = false;

    this.columns = 20;
    this.rows = 10;
    this.tile_size = 40;

    this.zone_id = "00";

    this.map = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // only up -> 0          tlb -> 10
                 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 2, // only left -> 3        trb -> 11
                 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, // only right -> 4
                 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, // only bottom -> 5
                 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // top and left -> 6
                 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, // top and right -> 7
                 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, // bot and left -> 8
                 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, // bot and right -> 9
                 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0,
                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ];

    //                                          0000 = tlbr
    this.collision_map = [ 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 0010, 
                           0001, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0101, 0000, 0000, 0000, 0000, 0000, 00000, 
                           0001, 0000, 0000, 0000, 0000, 1110, 1011, 0000, 0000, 0000, 0000, 0000, 0000, 0101, 0000, 0000, 0000, 0000, 0000, 1100, 
                           0001, 1010, 1010, 1010, 1001, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0111, 0000, 0000, 0000, 1110, 0000, 0100, 
                           0001, 0000, 0000, 0000, 0111, 0000, 0000, 0000, 1111, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0100, 
                           0001, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 0000, 1101, 0000, 0000, 0000, 0000, 0000, 1101, 0000, 0000, 0000, 0100, 
                           0001, 0000, 1101, 0000, 0000, 0000, 0000, 0000, 0000, 0101, 0000, 0000, 0000, 1111, 0000, 0101, 0000, 0000, 0000, 0100,
                           0001, 0000, 0101, 0000, 0000, 0000, 0000, 1110, 1010, 1000, 1000, 1011, 0000, 0000, 0000, 0100, 1000, 1001, 0000, 0100,
                           0001, 0000, 0101, 0000, 0000, 0000, 0000, 0000, 0000, 0100, 0001, 0000, 0000, 0000, 0000, 0100, 0000, 0001, 0000, 0100, 
                           1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000 ];

    this.width = this.tile_size * this.columns;
    this.height = this.tile_size * this.rows;

};

Game.World.prototype = {

    constructor : Game.World,

    setup: function(zone) {

        this.graphical_map  =  zone.graphical_map;
        this.collision_map  =  zone.collision_map;
        this.columns        =  zone.columns;
        this.rows           =  zone.rows;
        this.doors          =  new Array();
        this.zone_id        =  zone.id;        

        for (let index = zone.doors.length - 1; index > -1; --index) {

            let door = zone.doors[index];
            this.doors[index] = new Game.Door(door);

        }

    },

    collideObject: function(object) {

        // The four walls of our world

        if       (object.getLeft()   <  0            )  {  object.setLeft(0)              ;  object.velocity_x = 0;  }
        else if  (object.getRight()  >  this.width   )  {  object.setRight(this.width)    ;  object.velocity_x = 0;  };
        if       (object.getTop()    <  0            )  {  object.setTop(0)               ;  object.velocity_y = 0;  }
        else if  (object.getBottom() >  this.height  )  {  object.setBottom(this.height)  ;  object.velocity_y = 0;  object.jumping = false; };

        // Broad phase collision

        let top, bottom, left, right, value;

        top = Math.floor(object.getTop() / this.tile_size);
        left = Math.floor(object.getLeft() / this.tile_size);
        value = this.collision_map[top * this.columns + left];
        this.collider.collide(value, object, left * this.tile_size, top * this.tile_size, this.tile_size);

        top = Math.floor(object.getTop() / this.tile_size);
        right = Math.floor(object.getRight() / this.tile_size);
        value = this.collision_map[top * this.columns + right];
        this.collider.collide(value, object, right * this.tile_size, top * this.tile_size, this.tile_size);

        bottom = Math.floor(object.getBottom() / this.tile_size);
        left = Math.floor(object.getLeft() / this.tile_size);
        value = this.collision_map[bottom * this.columns + left];
        this.collider.collide(value, object, left * this.tile_size, bottom * this.tile_size, this.tile_size);

        bottom = Math.floor(object.getBottom() / this.tile_size);
        right = Math.floor(object.getRight() / this.tile_size);
        value = this.collision_map[bottom * this.columns + right];
        this.collider.collide(value, object, right * this.tile_size, bottom * this.tile_size, this.tile_size);

    },

    update: function() {

        this.player.velocity_y += this.gravity;
        this.player.update(); // check this

        this.player.velocity_x *= this.friction;
        this.player.velocity_y *= this.friction;

        this.collideObject(this.player);

    }

};



Game.World.Collider = function() {

    this.collide = function(value, object, tile_x, tile_y, tile_size) {

        switch(value) {

            //               0000 = tlbr


            case 1000 : this.collidePlatfromTop(object, tile_y); break;

            case 0100 : this.collidePlatfromLeft(object, tile_x);  break;

            case 0010 : this.collidePlatfromBottom(object, tile_y + tile_size);  break;

            case 0001 : this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1100 : if (this.collidePlatfromTop(object, tile_y)) return;  
                        this.collidePlatfromLeft(object, tile_x);    break;

            case 0110 : if (this.collidePlatfromBottom(object, tile_y + tile_size)) return;  
                        this.collidePlatfromLeft(object, tile_x);    break;

            case 0011 : if (this.collidePlatfromBottom(object, tile_y + tile_size)) return; 
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1001 : if (this.collidePlatfromTop(object, tile_y)) return;  
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1010: if (this.collidePlatfromTop(object, tile_y)) return; 
                        this.collidePlatfromBottom(object, tile_y + tile_size);  break;

            case 0101: if (this.collidePlatfromLeft(object, tile_x)) return;
                       this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1110 : if (this.collidePlatfromTop(object, tile_y)) return; 
                        if (this.collidePlatfromLeft(object, tile_x)) return;
                        this.collidePlatfromBottom(object, tile_y + tile_size);  break;

            case 0111 : if (this.collidePlatfromBottom(object, tile_y + tile_size)) return;
                        if (this.collidePlatfromLeft(object, tile_x)) return;
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1101 : if (this.collidePlatfromTop(object, tile_y)) return;
                        if (this.collidePlatfromLeft(object, tile_x)) return;
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

            case 1011 : if (this.collidePlatfromTop(object, tile_y)) return;
                        if (this.collidePlatfromBottom(object, tile_y + tile_size)) return;
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

            

            case 1111 : if (this.collidePlatfromTop(object, tile_y)) return;
                        if (this.collidePlatfromLeft(object, tile_x)) return;
                        if (this.collidePlatfromBottom(object, tile_y + tile_size)) return;
                        this.collidePlatfromRight(object, tile_x + tile_size);  break;

        }

    }

}


Game.World.Collider.prototype = {

    constructor : Game.World.Collider,

    collidePlatfromBottom: function(object, tile_bottom) {

        if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

            object.setTop(tile_bottom);
            object.velocity_y = 0;
            return true;

        } 
        
        return false;

    },

    collidePlatfromTop: function(object, tile_top) {

        if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

            object.setBottom(tile_top - 0.01); // -0.01
            object.velocity_y = 0;
            object.jumping = false;
            return true;

        } 
        
        return false;

    },

    collidePlatfromRight: function(object, tile_right) {

        if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

            object.setLeft(tile_right);
            object.velocity_x = 0;
            return true;

        }

        return false;

    },

    collidePlatfromLeft: function(object, tile_left) {

        if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {  // AGAGAGAGAHAHJAJKAJKUAAJKBAHJAHJALJAJQA I HAD GETOLDTOP INSTEAD OF GETOLDRIGHT GKBAJKDSBWGWFU  UILHEFU;O;E;

            object.setRight(tile_left - 0.01); // -0.01
            object.velocity_x = 0;
            return true;

        }

        return false;

    }

};


Game.World.Object = function(x, y, width, height) {

    this.width   =  width;
    this.height  =  height;
    this.x       =  x;
    this.x_old   =  x;
    this.y       =  y;
    this.y_old   =  y;

};

Game.World.Object.prototype = {

    constructor : Game.World.Object,

    getTop        : function() { return this.y                   },
    getLeft       : function() { return this.x                   },
    getBottom     : function() { return this.y     + this.height },
    getRight      : function() { return this.x     + this.width  },
    getOldTop     : function() { return this.y_old               },
    getOldLeft    : function() { return this.x_old               },
    getOldBottom  : function() { return this.y_old + this.height },
    getOldRight   : function() { return this.x_old + this.width  },

    setTop        : function(y) { this.y      =  y                },
    setLeft       : function(x) { this.x      =  x                },
    setBottom     : function(y) { this.y      =  y - this.height  },
    setRight      : function(x) { this.x      =  x - this.width   },
    setOldTop     : function(y) { this.y_old  =  y                },
    setOldLeft    : function(x) { this.x_old  =  x                },
    setOldBottom  : function(y) { this.y_old  =  y - this.height  },
    setOldRight   : function(x) { this.x_old  =  x - this.width   }

};

Game.World.Player = function(x, y) {
    
    Game.World.Object.call(this, 45, 300, 32, 32);

    this.color        =   color(200, 100, 50);

    this.velocity_x   =   0;
    this.velocity_y   =   0;

    this.jumpForce    =   40;
    this.jumping      =   false;

};

Game.World.Player.prototype = {

    //constructor : Game.Player,

    jump: function() {

        if (!this.jumping) {

            // this.color = color(random(255), random(255), random(255));

            this.jumping = true;
            this.velocity_y -= this.jumpForce;

        }

    },

    moveLeft  :  function() { this.velocity_x -= 0.5; },
    moveRight :  function() { this.velocity_x += 0.5; },

    update: function() {

        this.x_old = this.x;
        this.y_old = this.y;

        this.x += this.velocity_x;
        this.y += this.velocity_y;

    }    

};

Object.assign(Game.World.Player.prototype, Game.World.Object.prototype);
Game.World.Player.prototype.constructor = Game.World.Player;