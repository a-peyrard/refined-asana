import * as $ from 'jquery';
import { Tweak } from '../tweak';
import { isBoard } from "./PageDetect";
import { h } from 'dom-chef';

export default class MineBoardFilter implements Tweak {
    name: string = 'add a \'mine\' filter in the header of the board view';
    apply(asana): Promise<boolean> {
        if (isBoard()) {
            const currentUser = User.current();

            console.log(currentUser);

            tweakCollapse(currentUser);
            renderFilter(currentUser);
            return Promise.resolve(true);    
        }
        return Promise.resolve(false);
    };
};

/*
    tweak colapse to rerender the button if expanded again 
    fixme: need to find a better way to render the button as soon as we enter 
    the current state (as we might modify the state, by other means than the collapse/expand button)
*/
function tweakCollapse(currentUser: User) {
    const collapse = $('.PageHeaderStructure-collapseButton');
    $('.PageHeaderStructure-collapseButton').click(() => 
        setTimeout(
            () => $('.PageHeaderCollapsedStructure-uncollapseButton')
                    .click(() => setTimeout(() => renderFilter(currentUser), 500)),
            500
        )
    );
}

function findCards(): CardsStore {
    const store: CardsStore = new CardsStore();
    $('.BoardColumnCardsContainer-sortableListSortableItem')
        .each((idx, cardElement) => {
            const card = new Card(cardElement);
            store.store(card);
        });
    return store;
}

/*
    Render the button
*/
function renderFilter(currentUser: User) {
    const onlyMineButton = $(<span className={'Button Button--small Button--primary btn-only-mine'}>Only mine</span>);
    const allButton = $(<span className={'Button Button--small Button--primary topbarContingentUpgradeButton-button btn-all'}>All</span>)
        .hide();
    
    onlyMineButton.click((event) => {
        const store = findCards(); // find a way to update store when task are updated!?
        store.allButMine(currentUser)
             .forEach(card => card.hide());
        onlyMineButton.hide();
        allButton.show();
    });
    allButton.click((event) => {
        const store = findCards();
        store.allButMine(currentUser)
             .forEach(card => card.show());
        allButton.hide();
        onlyMineButton.show();
    });

    $('.PageHeaderStructure-left').append(onlyMineButton);
    $('.PageHeaderStructure-left').append(allButton);
};

class User {

    static current() {
        return User.fromAvatar($('.Topbar-settingsMenuAvatar'));
    }

    static fromAvatar(avatar) {
        const avatarUrl = avatar.css('background-image');
        const extractCommonRegex = /profile_photos\/(.*?)_/
        const match = extractCommonRegex.exec(avatarUrl);
        if (match) {
            return new User(match[1]);
        }
        return new User('unknown'); // fixme analyze what is done is no avatar is provided by the user
    }
    
    constructor(public readonly id: string) {}

    public equals(other: any): boolean {
        return other && this.id === other.id
    }
}

class Assignee {
    static unassigned(): Assignee {
        return new Assignee();
    }

    static assignedTo(user: User): Assignee {
        return new Assignee(user);
    }
    
    constructor(private readonly user?: User) {}

    public equals(other: any): boolean {
        return other &&
            ((this.user === undefined && other.user === undefined) || 
            (this.user !== undefined && this.user.equals(other.user)));
    }
    
    public match(user: User): boolean {
        return this.user !== undefined && this.user.equals(user)
    }
}

class Card {
    constructor(private readonly element: HTMLElement) {}

    extractAssignee(): Assignee {
        const avatar = $(this.element).find('.Assignee').children('.Avatar');
        if (avatar.length) {
            return Assignee.assignedTo(User.fromAvatar(avatar));
        }
        return Assignee.unassigned();
    }

    hide() {
        $(this.element).hide();
    }

    show() {
        $(this.element).show();
    }
}

class CardsStore {
    private readonly cards: [Assignee, Card[]][] = [];
    
    store(card: Card) {
        const assignee = card.extractAssignee();
        const tuple = this.cards.find(([a, c]) => assignee.equals(a));
        if (tuple) {
            const [a, c] = tuple!;
            c.push(card);
        } else {
            this.cards.push([assignee, [card]]);
        }
    }

    getFor(user: User): Card[] {
        const tuple = this.cards.find(([a, c]) => a.match(user));
        if (tuple) {
            const [a, c] = tuple!;
            return c;
        }
        return [];
    }

    allButMine(me: User): Card[] {
        return this.cards.reduce(
            (acc: Card[], cur: [Assignee, Card[]]) => {
                const [assignee, cards] = cur;
                if (assignee.match(me)) {
                    return acc;
                }
                acc.push(...cards);
                return acc;
            },
            []
        );
    }

    all(): Card[] {
        return this.cards.reduce(
            (acc: Card[], cur: [Assignee, Card[]]) => {
                const [a, c] = cur;
                acc.push(...c)
                return acc
            },
            []
        )    
    }
}
