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

        this.model = {
            hasShimmer: true
        };

        this.onReceive = (event, payload) => {
            if(event === 'section-active') {
                this.model.hasShimmer = !payload;
            }
        };

        this.renderTest2();

        this.startShimmer();
    }

    renderTest2() {
        this.sections = [
            new Node(), new Node(),
            new Node(), new Node()
        ];

        let modifier = new Node();
        modifier
            .setSizeMode('absolute', 'absolute', 'absolute')
            .setAbsoluteSize(200, 200)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5);

        for(let i = 0, j = this.sections.length; i < j; i++) {
            let section = this.sections[i];
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

            section
                .setSizeMode('relative', 'relative')
                .setProportionalSize(.5, .5)
                .setAlign(.5, .5)
                .setMountPoint(mountPoint[0], mountPoint[1])
                .setOrigin(mountPoint[0], mountPoint[1]);
            section.scale = new Scale(section);
            section.domEl = new DOMElement(section, {
                    tagName: 'div',
                    classes: ['logo'],
                    properties: {
                        'background-position': backgroundPosition,
                        'z-index': 5
                    }
                });

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

    startShimmer() {
        if(this.model.hasShimmer) {
            //var blar = this._shuffle(this.sections);
            for(let i = 0, j = this.sections.length; i < j; i++) {
                setTimeout(() => {
                    this._shimmer(this.sections[i]);
                }, Math.ceil(Math.random() * (1000 - 250) + 250));
            }
            //console.log('blar',blar);
        }
    }

    _shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
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