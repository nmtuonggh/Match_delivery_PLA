import { _decorator, Component, easing, instantiate, Node, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
   * Simulates a DoJump tween with parabolic motion.
   * @param node The node that will move.
   * @param startPos The starting position of the jump.
   * @param endPos The ending position of the jump.
   * @param jumpHeight The peak height of the jump.
   * @param duration Total time of the jump animation.
   * @param jumps Number of jumps (how many times the object jumps before reaching the end position).
   */
export function doJump ( tween: Tween<Node>, startPos: Vec3, endPos: Vec3, jumpHeight: number, duration: number, jumps: number, onComplete: () => void, autoStart = true )
{
    const singleJumpDuration = duration / jumps;

    let jumpIndex = 0;
    const performJump = () =>
    {
        // Calculate the parabolic arc for the current jump
        tween
            .to( singleJumpDuration, { worldPosition: endPos }, {
                onUpdate: ( target: Node, ratio: number ) =>
                {
                    // Linear interpolation for horizontal movement
                    const currentPos = new Vec3();
                    Vec3.lerp( currentPos, startPos, endPos, ratio );

                    // Calculate vertical position for parabolic arc
                    const arcHeight = jumpHeight * Math.sin( Math.PI * ratio ); // Creates a smooth up and down arc

                    // Set the node's position along the arc
                    target.setWorldPosition( currentPos.x, currentPos.y + arcHeight, currentPos.z );
                },
                onComplete: () =>
                {
                    jumpIndex++;
                    if ( jumpIndex < jumps )
                    {
                        // Start the next jump if more jumps are remaining
                        startPos = endPos; // Update starting point for the next jump
                        endPos = new Vec3( endPos.x + 10, endPos.y, endPos.z ); // Move the endpoint further for the next jump
                        performJump();
                    }
                    else
                    {
                        onComplete()
                    }
                }
            } )
        if ( autoStart )
            tween.start();
    };

    // Start the first jump
    performJump();
}

export function moveInParabola ( tile: Node, startPoint: Vec3, endPoint: Vec3, height: number, effectPos: Vec3 ): Promise<Node>
{
    return new Promise( ( resolve, reject ) =>
    {
        const height = startPoint.y > endPoint.y ? startPoint.y + 0.5 : endPoint.y + 0.5;
        let show = false;
        this.moveAlongParabola( tile, startPoint, endPoint, height, this._duration, () =>
        {
            if ( show ) return;
            show = true;
            let node = instantiate( this.prefabFxHit );
            this.node.addChild( node );
            node.setWorldPosition( effectPos );
            node.active = true;
        }, () =>
        {
            resolve( tile );
        } );
    } );
}

export function moveAlongParabola ( node: Node, start: Vec3, end: Vec3, height: number, duration: number, playEffect: () => void, onComplete?: () => void )
{
    let elapsedTime = 0;
    const interval = 0.016; // Khoảng thời gian cập nhật (thường là 60fps)
    function updatePosition ()
    {
        elapsedTime += interval;
        let t = elapsedTime / duration;
        if ( t > 1 )
        {
            // Hoàn thành chuyển động
            node.setWorldPosition( end );
            if ( onComplete ) onComplete();
            return;
        }
        else if ( t > 0.7 )
        {
            playEffect && playEffect();
        }
        // Áp dụng hàm easing để điều chỉnh t
        const easedT = easing.cubicInOut( t );
        // Tính toán vị trí dọc theo parabol với easedT
        const currentPos = Vec3.lerp( new Vec3( 0, 0, 0 ), start, end, easedT );
        const yOffset = 4 * height * easedT * ( 1 - easedT ); // Công thức parabol với y = -4h * easedT * (1 - easedT)
        currentPos.y += yOffset;
        node.setWorldPosition( currentPos );
        // Gọi lại sau khoảng thời gian nhỏ
        setTimeout( updatePosition, interval * 1000 );
    }
    updatePosition();
}

export function BezierTweenWorld ( node: Node, duration: number, p1: Vec3, p2: Vec3, p3: Vec3 ): Promise<void>
{
    return new Promise<void>( ( resolve ) =>
    {
        let tweenObj = { t: 0 };
        tween( tweenObj )
            .to( duration, { t: 1 }, {
                onUpdate: ( target: { t: number; }, ratio ) =>
                {
                    let easedT = easing.cubicInOut( ratio );
                    node.worldPosition = bezierPosition1( p1, p2, p3, easedT );
                },
                onComplete: () =>
                {
                    resolve();
                }
            } )
            .start();
    } );
}

export function bezierPosition1 ( p1: Vec3, p2: Vec3, p3: Vec3, t: number ): Vec3
{
    let u = 1 - t;
    let tt = t * t;
    let uu = u * u;
    // Công thức Bezier bậc 2
    let x = ( uu * p1.x ) + ( 2 * u * t * p2.x ) + ( tt * p3.x );
    let y = ( uu * p1.y ) + ( 2 * u * t * p2.y ) + ( tt * p3.y );
    let z = ( uu * p1.z ) + ( 2 * u * t * p2.z ) + ( tt * p3.z );
    return new Vec3( x, y, z );
}







