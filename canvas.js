const canvas = document.querySelector('canvas')
const c  = canvas.getContext('2d') // 2d 게임, canvas 객체의 api 속성에 넣어주는 것

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startBtn = document.querySelector('#startBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

// 플레이어
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() { 
        c.beginPath()
        c.arc(this.x , this.y, this.radius, 0, Math.PI*2, false);
        // 원을 그릴 수 있게 하는 메서드 | x 좌표, y 좌표, 반지름, 시작 각도, 끝 각도(파이*2 = 360도) , 방향 설정
        c.fillStyle = this.color
        c.fill()
    }
}

// 발사체
class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() { 
        c.beginPath()
        c.arc(this.x , this.y, this.radius, 0, Math.PI*2, false) // 원을 그릴 수 있게 하는 메서드 | x 좌표, y 좌표, 반지름, 시작 각도, 끝 각도(파이*2 = 360도) , 방향 설정
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x // x 좌표 == 현재 좌표 + 속도
        this.y = this.y + this.velocity.y
    }
}

// 적
class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() { 
        c.beginPath()
        c.arc(this.x , this.y, this.radius, 0, Math.PI*2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x // x 좌표 == 현재 좌표 + 속도
        this.y = this.y + this.velocity.y
    }
}

const x = canvas.width / 2
const y = canvas.height / 2
// 화면의 중앙에 플레이어가 위치하도록

let player = new Player(x, y, 10, 'white') // 플레이어 객체 생성 
let projectiles = []
let enemies = []

function init(){ // 게임 시작시 기존 플레이어 객체 초기화
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4 // 4 ~ 30 사이 값
         
        let x
        let y

        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius // 적 랜덤 생성
            y = Math.random() * canvas.height
        } else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        ) 

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animateId
let score = 0
function animate(){
    animateId = requestAnimationFrame(animate) // 애니메이션을 시작할 때 마다 계속 실행될 것
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    projectiles.forEach((projectile, index) => {
        projectile.update()

        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height){
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0) 
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

        // 게임 종료
        if(dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animateId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            
            // 사물이 닿았을 때 // 두 거리가 1보다 작을 때 
            if(dist - enemy.radius - projectile.radius < 1){
                if(enemy.radius - 7 > 3){
                    // 점수 올리기
                    score += Math.round(enemy.radius) * 10
                    scoreEl.innerHTML = score
                    enemy.radius -= 7
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0) 
                } else{
                        score += 250
                        scoreEl.innerHTML = score

                    setTimeout(() => {
                        enemies.splice(index, 1) 
                        projectiles.splice(projectileIndex, 1)
                    }, 0) 
                } 
            }
        })
    })
}

addEventListener('click', (event) => { // 화면을 클릭 할 때 마다 발사체를 활성화
    console.log(projectiles)
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
    )
})

startBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
})