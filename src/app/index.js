import isEqual          from 'lodash/lang/isEqual';
import {Piece}          from './Piece';
import observers        from './observers';

//Famous Components
//const GestureHandler    = Famous.components.GestureHandler;
const Curves            = Famous.transitions.Curves;
const DOMElement        = Famous.domRenderables.DOMElement;
const Node              = Famous.core.Node;
const Opacity           = Famous.components.Opacity;
const Position          = Famous.components.Position;
const Scale             = Famous.components.Scale;

/*
 *
 */
class App extends Node {
    constructor() {
        super();

        this.model = {
            hasShimmy: true,
            width: 250,
            height: 250,
            ratio: 10
        };

        this
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(300, 250)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5)
            .setOrigin(.5, .5);

        this.domEL = new DOMElement(this, {
            classes: ['app'],
            'properties': {
                'border': '1px solid #333333',
                'overflow': 'hidden'
            }
        });

        this.preloadImages();
        this.renderCTA();
        this.setEvents();
        this.createModifier();
        this.renderPieces();
        this.placePieces();

        setInterval(() => {
            if(this.model.hasShimmy) {
                this.initShimmy();
            }
        }, 5000); ///Fun Fact: 5000ms is the average human breath frequency
    }

    preloadImages() {
        let images = [
            'famous-logo.svg',
            'be-creative.svg',
            'famous-logo.svg',
            'be-empowered.svg',
            'famous-logo.svg',
            'be-famous.svg',
            'famous-logo-back.svg'
        ];

        images.forEach((image) => {
            let img = new Image();
            img.src = `images/${image}`
        });
    }

    renderCTA() {
        this.cta = new Node();
        this.cta
            .setAlign(.5, 1)
            .setMountPoint(.5, 1)
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(120, 30);

        this.cta.opacity = new Opacity(this.cta);
        this.cta.position = new Position(this.cta);
        this.cta.opacity.set(0);
        this.cta.position.setY(-10);

        this.cta.domEl = new DOMElement(this.cta, {
            tagName: 'a',
            content: 'Learn More',
            classes: ['button'],
            properties: {
                'text-align': 'center',
                'cursor': 'pointer'
            },
            attributes: {
                'href': 'http://www.famous.co',
                'target': '_blank'
            }
        });

        this.addChild(this.cta);
    }

    setEvents() {
        observers.pieceClicked.subscribe((payload) => {
            if(payload) {
                this.initViewController(payload);
            }
        });

        observers.finishAd.subscribe((payload) => {
           if(payload) {
               this.initFinale();
           }
        });
    }

    initFinale() {
        const duration = 1000;

        this.modifier.scale.set(.8, .8, .8, {
            duration,
            curve: Curves.inOutBack
        }, () => {
            this.cta.opacity.set(1, {
                duration
            });
        });
    }

    /*
     * a simple modifier node to better control the pieces
     */
    createModifier() {
        this.modifier = new Node();
        this.modifier
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(this.model.width, this.model.height)
            .setAlign(.5, .5)
            .setMountPoint(.5, .5)
            .setOrigin(.5, 0);

        this.modifier.scale = new Scale(this.modifier);
        this.addChild(this.modifier);
    }

    /*
     *
     */
    renderPieces() {
        const totalPieces = this.model.ratio * this.model.ratio;
        const size = [this.model.width / this.model.ratio, this.model.height / this.model.ratio];

        this.pieces = this.getPieces(totalPieces);

        for(let i = 0, j = this.pieces.length; i < j; i++) {
            const piece = this.pieces[i];
            const row = Math.floor(i / this.model.ratio);
            const column = Math.floor(i % this.model.ratio);

            const position = [row * size[0], column * size[1]];
            const scalePercentage = 100 * this.model.ratio;

            piece.model.position = position;
            piece.model.layout = [row, column];

            piece.domEl.setProperty('background-position', `${-position[0]}px ${-position[1]}px`);
            piece.domEl.setProperty('background-size', `${scalePercentage}% ${scalePercentage}%`);

            this.modifier.addChild(piece);
        }
    }

    /*
     * @params {integer} The number of pieces that will be used to create the ad
     * @returns {array} Nodes
     */
    getPieces(totalPieces) {
        let pieces = [];

        while(totalPieces) {
            pieces.push(new Piece({
                size: [this.model.width / this.model.ratio, this.model.height / this.model.ratio]

            }));

            totalPieces--;
        }

        return pieces;
    }

    /*
     * Animates the pieces from their random starting position into their place
     */
    placePieces() {
        this.pieces.forEach((piece) => {
            let duration = Math.random() * (1500 - 1000) + 1000;

            piece.position.setX(piece.model.position[0], {
                duration,
                curve: Curves.inBack
            });

            piece.position.setY(piece.model.position[1], {
                duration,
                curve: Curves.outBack
            });
        });
    }

    /*
     * Loops through all pieces and applies a calls a function to give visual awareness to the piece
     */
    initShimmy() {
        for(let i = 0, j = this.pieces.length; i < j; i++) {
            if(this.model.hasShimmy) {
                setTimeout(() => {
                    this.pieces[i].shimmy();
                }, Math.ceil(Math.random() * 1000 - 500));
            }
        }
    }

    /*
     * @param {Node}
     */
    initViewController(piece) {
        this.cycleView(piece, 1, 3);
    }

    /*
     * recursive function controlling the gathering and toggleing of content views
     * @param {array} this is the [x, y]
     * @param {integer} this is the [x, y]
     * @param {integer} this is the [x, y]
     */
    cycleView(piece, radius, reach) {
        let adjacentLayouts = this.getAdjacentLayouts(piece.model.layout, radius, reach);

        // the changes in radius and reach affect the length of the adjacent layouts that get returned
        if(adjacentLayouts.length) {
            adjacentLayouts.forEach((layout) => {
                let adjacentPiece = this.getPiece(layout);

                if(adjacentPiece) {
                    adjacentPiece.toggle();
                }
            });

            radius++;
            reach += 2;

            setTimeout(() => {
                this.cycleView(piece, radius, reach);
            }, 100);
        }
    }

    /*
     * gets all of the layouts in a certain view radius
     * @param {array} this is the [x, y]
     * @param {integer}
     * @param {integer}
     */
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
            if(layout[0] >= 0  && layout[0] < this.model.ratio && layout[1] >= 0 && layout[1] < this.model.ratio) {
                adjacentLayouts.push(layout);
            }
        });

        layoutsB.forEach((layout) => {
            if(layout[0] >= 0  && layout[0] < this.model.ratio && layout[1] >= 0 && layout[1] < this.model.ratio) {
                adjacentLayouts.push(layout);
            }
        });

        return adjacentLayouts;
    }

    /*
     * uses [x, y] position and matches it to a Piece node
     * @param {array} this is the [x, y]
     */
    getPiece(layout) {
        let piece;

        for(let i = 0, j = this.pieces.length; i < j; i++) {
            if(isEqual(layout, this.pieces[i].model.layout)) {
                piece = this.pieces[i];
                break;
            }
        }

        return piece;
    }
}

const scene = Famous.core.FamousEngine.createScene('#app');
window.app  = scene.addChild(new App());