import isEqual          from 'lodash/lang/isEqual';

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

            //NOT WORKING
            if(event === 'section-active') {
                console.log('here');
                this.model.hasShimmer = !payload;
            }
        };

        this.renderSection();
        this.loadSection();

        setInterval(() => {
            //console.log('hasShimmer', this.model.hasShimmer);
            if(this.model.hasShimmer) {
                this.initShimmer();
            }
        }, 5000); ///5000 ms is average breath frequenct
    }

    renderSection() {
        var ratio = 12;
        this.ratio = ratio;

        let width = 600;
        let height = 600;

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

            section.model = {
                position,
                layout: [row, column]
            };

            let startingPosition = this._getRandomPosition();

            section.rotation = new Rotation(section);
            section.position = new Position(section);
            section.position.setX(startingPosition[0]);
            section.position.setY(startingPosition[1]);
            section.scale = new Scale(section);
            section.domEl = new DOMElement(section, {
                tagName: 'div',
                classes: ['logo'],
                properties: {
                    'box-sizing': 'border-box',
                    'backface-visibility': 'hidden',
                    'background-position': `${-position[0]}px ${-position[1]}px`,
                    'background-size': `${100 * ratio}% ${100 * ratio}%`,
                    'z-index': 5,
                    'cursor': 'pointer'
                }
            });

            //EVENTS
            section.addUIEvent('mouseover');
            section.addUIEvent('mouseout');
            section.addUIEvent('click');
            section.onReceive = (event, payload) => {
                //TODO encapsulate cases into functions
                switch(event) {
                    case 'click':
                        this.toggleSection(section);
                        this.initRipple(section);
                        break;
                    case 'mouseover':
                        if(!section.model.isAnimating) {
                            section.scale.halt();
                            section.rotation.halt();
                            section.domEl.setProperty('z-index', 6);
                            section.scale.set(1.2, 1.2, 1.2, {
                                duration: 500,
                                curve: Curves.easeOutBounce
                            });
                        }
                        break;
                    case 'mouseout':
                        if(!section.model.isAnimating) {
                            section.scale.halt();
                            section.rotation.halt();
                            section.scale.set(1, 1, 1, {
                                duration: 500,
                                curve: Curves.easeOut
                            }, () => {
                                section.emit('section-active', false);
                                section.domEl.setProperty('z-index', 5);
                            });
                        }
                        break;
                }
            };

            modifier.addChild(section);
        }

        this.addChild(modifier);
    }

    loadSection() {
        this.sections.forEach((section) => {
            let duration = Math.random() * (1500 - 1000) + 1000;

            section.position.setX(section.model.position[0], {
                duration,
                curve: Curves.inBack
            });

            section.position.setY(section.model.position[1], {
                duration,
                curve: Curves.outBack
            });
        });
    }

    initShimmer() {
        for(let i = 0, j = this.sections.length; i < j; i++) {
            if(this.model.hasShimmer) {
                setTimeout(() => {
                    this._shimmer(this.sections[i]);
                }, Math.ceil(Math.random() * 1000 - 500));
            }
        }
    }
    
    initRipple(section) {
        this.flipCard(section, 1, 3);
    }

    flipCard(section, radius, reach) {
        let adjacentLayouts = this.getAdjacentLayouts(section.model.layout, radius, reach);

        if(adjacentLayouts.length) {
            adjacentLayouts.forEach((layout) => {
                this.rippleFlip(layout);
            });

            radius++;
            reach += 2;

            setTimeout(() => {
                this.flipCard(section, radius, reach);
            }, 100);
        }
    }

    getAdjacentLayouts(position, radius, reach) {
        let adjacentLayouts = [];

        let topLeft = [position[0] - radius, position[1] - radius];
        let bottomRight = [position[0] + radius, position[1] + radius];

        let layoutsA = []; //Goes right 2 (reach - 1) and down 1 (reach - 2)
        let layoutsB = []; //Goes up 2 (reach - 2) and left 1 (reach - 1)

        layoutsA.push(topLeft);
        layoutsB.push(bottomRight);

        for(let i = 1; i <= reach - 1; i++) {
            // A: right
            layoutsA.push([topLeft[0] + i, topLeft[1]]);

            // B: left
            layoutsB.push([bottomRight[0] - i, bottomRight[1]]);

            if(i <= reach - 2) {
                // A: Down
                layoutsA.push([topLeft[0], topLeft[1] + i]);

                // B: up
                layoutsB.push([bottomRight[0], bottomRight[1] - i]);
            }
        }

        layoutsA.forEach((layout) => {
            if(layout[0] >= 0  && layout[0] < this.ratio && layout[1] >= 0 && layout[1] < this.ratio) {
                adjacentLayouts.push(layout);
            }
        });

        layoutsB.forEach((layout) => {
            if(layout[0] >= 0  && layout[0] < this.ratio && layout[1] >= 0 && layout[1] < this.ratio) {
                adjacentLayouts.push(layout);
            }
        });

        return adjacentLayouts;
    }

    rippleFlip(layout) {
        let section = this.getSection(layout);

        if(section) {
            this.toggleSection(section);
        }
    }

    getSection(layout) {
        let section;

        for(let i = 0, j = this.sections.length; i < j; i++) {
            if(isEqual(layout, this.sections[i].model.layout)) {
                section = this.sections[i];
                break;
            }
        }

        return section;
    }

    toggleSection(section) {
        section.model.isAnimating = true;
        section.rotation.set(0, Math.PI, 0, {
            duration: 1000,
            curve: Curves.outBack
        }, () => {
            section.rotation.set(0, 0, 0, {
                duration: 1000,
                curve: Curves.outBack
            }, () => {
                section.model.isAnimating = false;
            });
        });

        /*section.scale.halt();
        section.scale.set(1.2, 1.2, 1.2, {
            duration: 500,
            curve: Curves.easeOutBounce
        }, () => {
            section.scale.set(1, 1, 1, {
                duration: 500,
                curve: Curves.easeOutBounce
            });
        });*/
    }



    _getRandomPosition(x, y) {
        x = (Math.random() * window.innerWidth) - (window.innerWidth / 2);
        y = (Math.random() * window.innerHeight) - (window.innerHeight / 2);

        return [x, y];
    }

    _shimmer(section) {
        section.scale.halt();
        section.scale.set(1.2, 1.2, 1.2, {
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