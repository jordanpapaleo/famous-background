//Famous Components
const DOMElement        = Famous.domRenderables.DOMElement;
const GestureHandler    = Famous.components.GestureHandler;
const Curves            = Famous.transitions.Curves;
const Node              = Famous.core.Node;
const Rotation          = Famous.components.Rotation;
const Position          = Famous.components.Position;
const Scale             = Famous.components.Scale;
const Size              = Famous.components.Size;

class App extends Node {
    constructor() {
        super();

        this
            .setSizeMode('relative', 'relative', 'relative')
            .setProportionalSize(1, 1, 1)
            .setAlign(0, 0)
            .setMountPoint(0, 0)
            .setOrigin(0, 0);

        this.model = {
            hasShimmer: true
        };

        this.onReceive = (event, payload) => {
            if(event === 'section-active') {
                this.model.hasShimmer = !payload;
            }
        };

        this.renderTest2();

        this.initShimmer();
    }

    renderTest2() {
        var ratio = 7;

        let width = 400;
        let height = 400;

        this.sections = [];

        let nodeCount = ratio * ratio;
        while(nodeCount) {
            this.sections.push(new Node());
            nodeCount--;
        }

        let modifier = new Node();
        modifier
            .setSizeMode('absolute', 'absolute', 'absolute')
            .setAbsoluteSize(width, height)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5);


        var size = { x: width / ratio, y: height / ratio};

        for(let i = 0, j = this.sections.length; i < j; i++) {
            var row = Math.floor(i / ratio);
            var column = Math.floor(i % ratio);

            let position = [row * size.x, column * size.y];
            let section = this.sections[i];

            section
                .setSizeMode('absolute', 'absolute')
                .setAbsoluteSize(size.x, size.y)
                .setAlign(0, 0)
                .setMountPoint(0, 0)
                .setOrigin(.5, .5);

            section.position = new Position(section);
            section.position.setX(position[0]);
            section.position.setY(position[1]);
            section.scale = new Scale(section);
            section.domEl = new DOMElement(section, {
                tagName: 'div',
                classes: ['logo'],
                properties: {
                    'box-sizing': 'border-box',
                    'background-position': `${-position[0]}px ${-position[1]}px`,
                    'background-size': `${100 * ratio}% ${100 * ratio}%`,
                    'border': '1px solid hotpink',
                    'z-index': 5
                }
            });

            //EVENTS
            section.addUIEvent('mouseover');
            section.addUIEvent('mouseout');
            section.onReceive = (event, payload) => {
                section.scale.halt();

                if(event === 'mouseover'){
                    section.emit('section-active', true);
                    section.domEl.setProperty('z-index', 6);
                    section.scale.set(1.1, 1.1, 1.1, {
                        duration: 250,
                        curve: Curves.easeOutBounce
                    });
                } else if(event === 'mouseout') {
                    section.scale.set(1, 1, 1, {
                        duration: 250,
                        curve: Curves.easeOutBounce
                    }, () => {
                        section.emit('section-active', false);
                        section.domEl.setProperty('z-index', 5);
                    });
                }
            };

            modifier.addChild(section);
        }

        this.addChild(modifier);
    }

    initShimmer() {
        for(let i = 0, j = this.sections.length; i < j; i++) {
            if(this.model.hasShimmer) {
                setTimeout(() => {
                    this._shimmer(this.sections[i]);
                }, Math.ceil(Math.random() * (1000 - 250) + 250));
            }
        }
    }

    _shimmer(section) {
        section.scale.halt();
        section.scale.set(1.05, 1.05, 1.05, {
            duration: 200
        }, () => {
            section.scale.set(1, 1, 1, {
                duration: 200
            });
        });
    }
}

const scene = Famous.core.FamousEngine.createScene('#app');
window.app  = scene.addChild(new App());