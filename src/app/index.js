import isEqual          from 'lodash/lang/isEqual';
import {Piece}          from './Piece';
import observers        from './observers';

//Famous Components
//const GestureHandler    = Famous.components.GestureHandler;
const Curves            = Famous.transitions.Curves;
const Node              = Famous.core.Node;

/*
 *
 */
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
            hasShimmy: true,
            width: 600,
            height: 600,
            ratio: 15
        };

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

    setEvents() {
        observers.pieceClicked.subscribe((payload) => {
            if(payload) {
                this.initViewController(payload);
            }
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
            .setMountPoint(.5, .5);

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