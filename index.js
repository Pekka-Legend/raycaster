const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

var FOV = .5 * Math.PI
var RES = 1

var spriteSheet = new Image()
spriteSheet.src = 'spritesheet.png'

map = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2], 
    [2, 0, 0, 0, 2, 2, 2, 2, 2, 2], 
    [2, 0, 0, 0, 2, 2, 0, 0, 0, 2], 
    [2, 0, 2, 0, 2, 2, 0, 0, 0, 2], 
    [2, 0, 2, 0, 2, 2, 0, 2, 0, 2], 
    [2, 0, 2, 0, 0, 0, 0, 2, 0, 2], 
    [2, 0, 2, 0, 0, 0, 0, 2, 0, 2], 
    [2, 0, 2, 2, 2, 2, 2, 2, 0, 2], 
    [2, 0, 0, 0, 0, 0, -1, 0, 0, 2], 
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
]

tileSize = (canvas.width * .25) / map.length //NEVER round this value for calculations, it messes up the raycast function and makes the rays clip through corners
offsetNum = tileSize / 64

var keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
}

class Player
{
    constructor()
    {
        this.x = 5 * tileSize + tileSize / 2
        this.y = 8 * tileSize + tileSize / 2
        this.speed = 0
        this.topSpeed = 480 /  tileSize
        this.acceleration = 3 / tileSize
        this.turnSpeed = 35
        this.direction = Math.PI * 1.5
        this.radius = tileSize / 10
    }
    draw()
    {
        c.fillStyle = 'yellow'
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        c.fill()

        c.beginPath()
        c.strokeStyle = 'yellow'
        c.lineWidth = tileSize / 10
        c.moveTo(this.x, this.y)
        c.lineTo(this.x + (-Math.sin(this.direction) * tileSize / 5), this.y + (Math.cos(this.direction) * tileSize / 5))
        c.stroke()

    }
    update()
    {
        if (keys.w == true)
        {
            this.speed += this.acceleration
            if (this.speed > this.topSpeed)
            {
                this.speed = this.topSpeed
            }
            
        }
        else if (keys.s == true)
        {

        }
        else if (keys.w != true)//neither forward nor baonk are pressed, lose speed gradually
        {
            if (this.speed > 0)
            {
                this.speed -= .1
            }
            else if (this.speed < 0)
            {
                this.speed += .1
            }

            if (Math.abs(this.speed) < .3)
            {
                this.speed = 0
            }
        }

        if (keys.a == true)
        {
            this.direction -= .1 * dt * this.turnSpeed
            if (this.direction < 0)
            {
                this.direction = 6.28
            }
        }
        if (keys.d == true)
        {
            this.direction += .1 * dt * this.turnSpeed
            if (this.direction > 6.28)
            {
                this.direction = 0
            }
        }
        if (keys.shift)
        {
            this.direction += .001 * dt * this.turnSpeed
            if (this.direction > 6.28)
            {
                this.direction = 0
            }
        }

        //player movement
        for (var i = 0; i < this.speed; i++)
        {
            this.x += -Math.sin(this.direction) * dt * 10
            

            let testX = Math.floor(this.x / (tileSize))
            let testY = Math.floor(this.y / (tileSize))
            if (map[testY][testX] > 0) //if the tile you are in is solid
            {
                c.fillStyle = 'red'
                c.fillRect(Math.floor(this.x / (tileSize)) * tileSize, Math.floor(this.y / (tileSize)) * tileSize, tileSize, tileSize)
                while(map[testY][testX] > 0)
                {
                    this.x -= -Math.sin(this.direction) * dt
                    testX = Math.floor(this.x / (tileSize))
                }
                this.speed -= .1
            
            }

            this.y += Math.cos(this.direction) * dt * 10

            testX = Math.floor(this.x / (tileSize))
            testY = Math.floor(this.y / (tileSize))
            if (map[testY][testX] > 0) //if the tile you are in is solid
            {
                c.fillStyle = 'red'
                c.fillRect(Math.floor(this.x / (tileSize)) * tileSize, Math.floor(this.y / (tileSize)) * tileSize, tileSize, tileSize)
                while(map[testY][testX] > 0)
                {
                    this.y -= Math.cos(this.direction) * dt
                    testY = Math.floor(this.y / (tileSize))
                }

                this.speed -= .1
            
            }
        }

    }
}
function intersectionOfLines(x_1, y_1, x_2, y_2, x_3, y_3, x_4, y_4)
{
    let x1 = x_1
    let y1 = y_1
    let x2 = x_2
    let y2 = y_2
    let x3 = x_3
    let y3 = y_3
    let x4 = x_4
    let y4 = y_4


    if (x1 == x2)//stops the slope from being undefined
    {
        x1 -= .0000001
    }
    if (x3 == x4)//stops the slope from being undefined
    {
        x3 -= .0000001
    }
    let slope1 = (y2 - y1) / (x2 - x1)
    let b1 = y1 - (slope1 * x1)
    let slope2 = (y4 - y3) / (x4 - x3)
    let b2 = y3 - (slope2 * x3)

    let deltaSlope = slope1 - slope2
    let deltaB = b2 - b1
    let intersectX = deltaB / deltaSlope
    let intersectY = (slope1 * intersectX) + b1
    return {
        x: intersectX,
        y: intersectY}
}
function lengthOfSegment(x1, y1, x2, y2)
{
    if (x2 < x1)
    {
        let t = x2
        x2 = x1
        x1 = t
    }
    if (y2 < y1)
    {
        let t = y2
        y2 = y1
        y1 = t
    }
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
}

function raycast(x, y, dir, i = 0, playerDir)
{
    let startX = x - -Math.sin(dir)
    let startY = y - Math.cos(dir)
    let tx = startX
    let ty = startY
    let direction = dir
    let columnx
    let columny
    let xIntCoords
    let yIntCoords
    
    let r = false
    let d = false
    let shouldExit = false
    let its = 0

    let returnCoords = {x: 0, y: 0, length: 0, idx: i, offset: 0, type: 0}

    if (direction < 0)
    {
        direction = 6.28 + direction
    }
    while(!shouldExit)
    {
        columnx = Math.floor((tx) / (tileSize))
        columny = Math.floor((ty) / (tileSize))

        r = false
        d = false
        if (direction >= Math.PI) //if facing right
        {
            columnx++
            r = true //if the player is facing right, the column is already correct because it is the same thing as the right of the current tile. I need this variable because if the player is facing left I have to subtract 1 from columnx so that it checks the right index on the map array
        }
        if (direction <= Math.PI * .5 || direction >= Math.PI * 1.5) //if facing down
        {
            columny++
            d = true //same thing as r, I don't feel like explaining it again here, just NEVER delete r or d
        }
        xIntCoords = intersectionOfLines(tx, ty, tx + -Math.sin(direction) * 2, ty + Math.cos(direction) * 2, columnx * tileSize -.00000001, 0, columnx * tileSize, 2) //find intersection of vertical line
        yIntCoords = intersectionOfLines(tx, ty, tx + -Math.sin(direction) * 2, ty + Math.cos(direction) * 2, 0, columny * tileSize, 1, columny * tileSize - .00000001) //find intersection of horizontal line
        
        let xMeasure = lengthOfSegment(tx, ty, xIntCoords.x, xIntCoords.y)
        let yMeasure = lengthOfSegment(tx, ty, yIntCoords.x, yIntCoords.y)
        if (xMeasure < yMeasure) //if the vertical intersection is closer than the horizontal intersection
        {
            if (map[Math.floor(xIntCoords.y / (tileSize))][columnx - !r] <= 0) //
            {
                tx = xIntCoords.x
                ty = xIntCoords.y
                if (direction <= Math.PI)
                {
                    tx -= .00001
                }
            }
            else
            {
                returnCoords.offset = (xIntCoords.y - (Math.floor(xIntCoords.y / (tileSize))) * tileSize)
                returnCoords.offset = (63 / tileSize) * (returnCoords.offset)
                if (direction <= Math.PI) //invert the texture so it is facing the correct direction
                {
                    returnCoords.offset = 0 + (63 - returnCoords.offset)
                }
                returnCoords.length = 4000 / lengthOfSegment(startX, startY, xIntCoords.x, xIntCoords.y) //I could add * Math.cos(deltaDirection) but I like the fisheye effect
                returnCoords.type = map[Math.floor(xIntCoords.y / (tileSize))][columnx - !r]
                shouldExit = true
            }
        }
        else if (yMeasure <= xMeasure) //if the horizontal intersection is closer than the vertical intersection
        {
            if (map[columny - !d][Math.floor(yIntCoords.x / (tileSize))] <= 0) //
            {
                tx = yIntCoords.x
                ty = yIntCoords.y
                if (direction <= Math.PI * .5 || direction >= Math.PI * 1.5)
                {
                    ty += .00001
                }
            }
            else
            {
                returnCoords.offset = (yIntCoords.x - (Math.floor(yIntCoords.x / (tileSize))) * tileSize)
                returnCoords.offset = (63 / tileSize) * (returnCoords.offset)
                if (direction <= Math.PI * .5 || direction >= Math.PI * 1.5) //invert the texture so it is facing the correct direction
                {
                    returnCoords.offset = 0 + (63 - returnCoords.offset)
                }
                returnCoords.length = 4000 / lengthOfSegment(startX, startY, yIntCoords.x, yIntCoords.y) //I could add * Math.cos(deltaDirection) but I like the fisheye effect
                returnCoords.type = map[columny - !d][Math.floor(yIntCoords.x / (tileSize))]
                shouldExit = true
            }
        }
    }
    
    return returnCoords
}

function drawMap()
{
    for (var i = 0; i < map.length; i++)
    {
        for (var j = 0; j < map.length; j++)
        {
            if (map[i][j] > 0)
            {
                c.fillStyle = 'white'
                
            }
            else if (map[i][j] == -1)
            {
                c.fillStyle = 'limegreen'
            }
            else
            {
                c.fillStyle = 'darkgrey'
            }
            c.fillRect(j * tileSize, i * tileSize, tileSize, tileSize)
            
        }
    }
}



player = new Player()

var ct = Date.now()
var dt
var pt = ct

function drawFPS()
{
    c.fillStyle = 'red'
    c.font = "40px Arial"
    let width = c.measureText("FPS: " + Math.floor(1 / dt).toString()).width
    c.fillText("FPS: " + Math.floor(1 / dt).toString(), canvas.width - width - canvas.width / 64, canvas.width / 32)
}

function raycastScreen()
{
    posList = []
    let scanlines = canvas.width / RES
    let dir = player.direction - FOV / 2
    if (dir < 0)
    {
        dir = 6.28 + dir //dir will be negative so you just have to add
    }
    for (var i = 0; i < scanlines; i++)
    {
        posList.push(raycast(player.x, player.y, dir, i, player.direction))
        
        dir += FOV / scanlines
        if (dir > 6.28)
        {
            dir = 0 + dir - 6.28
        }
        if (dir < 0)
        {
            dir = 6.28 + dir //dir will be negative so you just have to add
        }
    }
    posList.sort((a, b) =>{
        a.length - b.length
    })
    posList.forEach(ray =>{

        c.drawImage(spriteSheet, ray.offset + ((ray.type - 1) * 64), 0, 1, 64, ray.idx * RES, canvas.height / 2 - ray.length, RES, 2 * ray.length)

    })

}

function animate()
{
    ct = Date.now()
    dt = (ct - pt) / 1000
    
    requestAnimationFrame(animate)
    c.fillRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'skyblue'
    c.fillRect(0, 0, canvas.width, canvas.height / 2)
    c.fillStyle = 'grey'
    c.fillRect(0, canvas.height / 2, canvas.width, canvas.height)
    drawFPS()

    
    player.update()


    raycastScreen()

    drawMap()
    player.draw()

    pt = ct
}
animate()

document.onkeydown = function(e)
{
    if (e.key == 'w' || e.key == 'ArrowUp')
    {
        keys.w = true
    }
    if (e.key == 's' || e.key == 'ArrowDown')
    {
        keys.s = true
    }
    if (e.key == 'a' || e.key == 'ArrowLeft')
    {
        keys.a = true
    }
    if (e.key == 'd' || e.key == 'ArrowRight')
    {
        keys.d = true
    }
    if (e.key == "Shift")
    {
        keys.shift = true
    }
}
document.onkeyup = function(e)
{
    if (e.key == 'w' || e.key == 'ArrowUp')
    {
        keys.w = false
    }
    if (e.key == 's' || e.key == 'ArrowDown')
    {
        keys.s = false
    }
    if (e.key == 'a' || e.key == 'ArrowLeft')
    {
        keys.a = false
    }
    if (e.key == 'd' || e.key == 'ArrowRight')
    {
        keys.d = false
    }
    if (e.key == "Shift")
    {
        keys.shift = false
    }
}