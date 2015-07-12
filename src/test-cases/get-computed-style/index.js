import mapValues from 'lodash.mapvalues';

const PROPERTIES = {
    stylesheet: {
        name: 'background-color',
        value: 'blue'
    },
    inline: {
        name: 'color',
        value: 'red'
    }
};


let style = document.createElement('style');
style.innerHTML = `
    div {
        ${PROPERTIES.stylesheet.name}: ${PROPERTIES.stylesheet.value};
    }
`;
document.head.appendChild(style);


let divs = [ 'never_attached', 'attached', 'attached_and_detached' ]
    .map((id) => {
        let div = document.createElement('div');
        div.style[PROPERTIES.inline.name] = PROPERTIES.inline.value;
        div.id = id;
        
        return div;
    })
    .reduce((divs, div) => {
        divs[div.id] = div;
        
        return divs;
    }, { });

[ divs.attached, divs.attached_and_detached ].forEach((div) => {
    document.body.appendChild(div);
});

setTimeout(() => {
    divs.attached_and_detached.parentNode.removeChild(divs.attached_and_detached);
    
    setTimeout(() => {
        window.__results__.push(mapValues(divs, (div) => {
            let style = window.getComputedStyle(div, null);
            
            return {
                stylesheet: style.getPropertyValue(PROPERTIES.stylesheet.name),
                inline: style.getPropertyValue(PROPERTIES.inline.name)
            };
        }));
    }, 100);
}, 100);