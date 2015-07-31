import observers        from './observers';

//Famous Components
const Curves            = Famous.transitions.Curves;
const DOMElement        = Famous.domRenderables.DOMElement;
const Node              = Famous.core.Node;
const Position          = Famous.components.Position;
const Rotation          = Famous.components.Rotation;
const Scale             = Famous.components.Scale;

/*
 *
 */
export class Piece extends Node {
    constructor(model = {}) {
        super();

        this.model = model;
        this.model.isFront = false;
        this.model.images = [
            'famous-logo.svg',
            'be-creative.svg',
            'famous-logo.svg',
            'be-empowered.svg',
            'famous-logo.svg',
            'be-famous.svg',
            'famous-logo-back.svg'
        ];
        this.model.currentImageIndex = 0;

        this
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(this.model.size[0], this.model.size[1])
            .setAlign(0, 0)
            .setMountPoint(0, 0)
            .setOrigin(.5, .5);

        this.rotation = new Rotation(this);
        this.scale = new Scale(this);

        let startingPosition = this._getRandomPosition();
        this.position = new Position(this);
        this.position.setX(startingPosition[0]);
        this.position.setY(startingPosition[1]);

        this.domEl = new DOMElement(this, {
            tagName: 'div',
            classes: ['piece'],
            properties: {
                'background-image': `url('images/${this.model.images[this.model.currentImageIndex]}')`
            }
        });

        this.model.currentImageIndex++;

        this._setEvents();
    }

    /*
     *
     */
    _setEvents() {
        this.addUIEvent('mouseover');
        this.addUIEvent('mouseout');
        this.addUIEvent('click');
        this.onReceive = (event, payload) => {
            switch(event) {
                case 'click':
                    this._click();
                    break;
                case 'mouseover':
                    this._mouseover();
                    break;
                case 'mouseout':
                    this._mouseout();
                    break;
            }
        };
    }

    /*
     *
     */
    shimmy() {
        this.scale.halt();
        this.scale.set(1.2, 1.2, 1.2, {
            duration: 200
        }, () => {
            this.scale.set(1, 1, 1, {
                duration: 200
            });
        });
    }

    /*
     *
     */
    _click() {
        observers.pieceClicked.update(this);
        this.toggle(this);
    }
    /*
     *
     */
    _mouseover() {
        if(!this.model.isAnimating) {
            this.scale.halt();
            this.rotation.halt();
            this.domEl.setProperty('z-index', 6);
            this.scale.set(1.2, 1.2, 1.2, {
                duration: 500,
                curve: Curves.easeOutBounce
            });
        }
    }

    /*
     *
     */
    _mouseout() {
        if(!this.model.isAnimating) {
            this.scale.halt();
            this.rotation.halt();
            this.scale.set(1, 1, 1, {
                duration: 500,
                curve: Curves.easeOut
            }, () => {
                this.domEl.setProperty('z-index', 5);
            });
        }
    }

    /*
     *
     */
    _getRandomPosition(x, y) {
        x = (Math.random() * window.innerWidth) - (window.innerWidth / 2);
        y = (Math.random() * window.innerHeight) - (window.innerHeight / 2);

        return [x, y];
    }

    /*
     *
     */
    toggle() {
        this.model.isAnimating = true;
        this.rotation.set(0, (Math.PI * 90) / 180, 0, {
            duration: 750,
            curve: Curves.inBack
        }, () => {
            if(this.model.currentImageIndex < this.model.images.length) {
                this.domEl.setProperty('background-image', `url('images/${this.model.images[this.model.currentImageIndex]}')`);
                this.model.currentImageIndex++;
            } else {
                let path = '';

                if(this.model.isFront) {
                    path = `url('images/${this.model.images[this.model.images.length -1]}')`;
                } else {
                    path = `url('images/${this.model.images[0]}')`;
                }

                this.domEl.setProperty('background-image', path);
                this.model.isFront = !this.model.isFront;
            }

            this.rotation.set(0, (Math.PI * 0) / 180, 0, {
                duration: 750,
                curve: Curves.outBack
            }, () => {
                if(this.model.currentImageIndex === this.model.images.length) {
                    observers.finishAd.update(true);
                }

                this.model.isAnimating = false;
            });
        });
    }
}