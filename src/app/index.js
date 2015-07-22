//Famous Components
const DOMElement        = Famous.domRenderables.DOMElement;
const GestureHandler    = Famous.components.GestureHandler;
const Curves            = Famous.transitions.Curves;
const Node              = Famous.core.Node;
const Rotation          = Famous.components.Rotation;
const Scale             = Famous.components.Scale;

class App extends Node {
    constructor() {
        super();

        this
            .setSizeMode('relative', 'relative', 'relative')
            .setProportionalSize(1, 1, 1)
            .setAlign(0, 0)
            .setMountPoint(0, 0)
            .setOrigin(0, 0);

        this.renderTest2();
    }

    renderTest2() {
        let quads = [new Node(), new Node(), new Node(), new Node()];
        let modifier = new Node();
        modifier
            .setSizeMode('absolute', 'absolute', 'absolute')
            .setAbsoluteSize(200, 200)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5);

        for(let i = 0, j = quads.length; i < j; i++) {
            let quad = quads[i];
            let mountPoint = [0, 0], backgroundPosition = 'left top';

            switch(i) {
                case 0:
                    backgroundPosition = 'left top';
                    mountPoint = [1, 1];
                    break;
                case 1:
                    backgroundPosition = 'right top';
                    mountPoint = [0, 1];
                    break;
                case 2:
                    backgroundPosition = 'left bottom';
                    mountPoint = [1, 0];
                    break;
                case 3:
                    backgroundPosition = 'right bottom';
                    mountPoint = [0, 0];
                    break;
            }

            quad
                .setSizeMode('relative', 'relative')
                .setProportionalSize(.5, .5)
                .setAlign(.5, .5)
                .setMountPoint(mountPoint[0], mountPoint[1])
                .setOrigin(.5, .5);
            quad.scale = new Scale(quad);
            quad.domEl = new DOMElement(quad, {
                    tagName: 'div',
                    classes: ['logo'],
                    properties: {
                        'background-position': backgroundPosition,
                        'z-index': 5
                    }
                });

            quad.addUIEvent('mouseover');
            quad.addUIEvent('mouseout');

            quad.onReceive = function(event, payload){
                quad.scale.halt();

                if(event === 'mouseover'){
                    quad.domEl.setProperty('z-index', 6);
                    quad.scale.set(1.1, 1.1, 1.1, {
                        duration: 250
                    });
                } else if(event === 'mouseout') {
                    quad.scale.set(1, 1, 1, {
                        duration: 250
                    }, () => {
                        quad.domEl.setProperty('z-index', 5);
                    });
                }
            };

            modifier.addChild(quad);
        }

        this.addChild(modifier);
    }

    renderTest1() {
        let modifier = new Node();
        modifier
            .setSizeMode('absolute', 'absolute', 'absolute')
            .setAbsoluteSize(200, 200)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5)
            .setOrigin(.5, 0)
            .domEl = new DOMElement(modifier, {
                tagName: 'div',
                properties: {
                    'border': '1px solid black',
                    'border-radius': '50%',
                    'width': '200px',
                    'height': '200px'
                }
        });

        let front = new Node();
        front
            .setSizeMode('relative', 'absolute')
            .setProportionalSize(1, null)
            .setAbsoluteSize(null, 15)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5)
            .domEl = new DOMElement(front, {
            tagName: 'div',
            content: 'BUSYBEE',
            properties: {
                'backface-visibility': 'hidden',
                'border': '1px solid blue',
                'text-align': 'center'
            }
        });

        let back = new Node();
        back
            .setSizeMode('relative', 'absolute')
            .setProportionalSize(1, null)
            .setAbsoluteSize(null, 15)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5)
            .domEl = new DOMElement(front, {
            tagName: 'div',
            content: 'EARs',
            properties: {
                'backface-visibility': 'hidden',
                'border': '1px solid green',
                'text-align': 'center'
            }
        });

        back.rotation = new Rotation(back);
        back.rotation.set(0, (Math.PI * 180) / 180, 0);

        modifier.addChild(back);
        modifier.addChild(front);
        this.addChild(modifier);

        modifier.rotation = new Rotation(modifier);
        /*modifier.rotation.setY((Math.PI * 720) / 180, {
         duration: 2000,
         curve: Curves.inOutBack
         }, () => {
         console.log('here');
         });*/
    }
}

const scene = Famous.core.FamousEngine.createScene('#app');
window.app  = scene.addChild(new App());