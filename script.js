document.getElementById('task_management') &&
    new Vue({
        el: '#task_management',
        created: function () {
            setTimeout(() => {
                this.init_draggble();
            }, 500);
        },
        methods: {
            init_draggble: function () {
                const draggables = document.querySelectorAll('.draggable')
                const containers = document.querySelectorAll('.container')

                draggables.forEach(draggable => {
                    draggable.addEventListener('dragstart', () => {
                        draggable.classList.add('dragging')
                    })

                    draggable.addEventListener('dragend', () => {
                        draggable.classList.remove('dragging')
                    })
                })

                containers.forEach(container => {
                    container.addEventListener('dragover', e => {
                        e.preventDefault()
                        const afterElement = this.getDragAfterElement(container, e.clientY)
                        const draggable = document.querySelector('.dragging')
                        if (afterElement == null) {
                            container.appendChild(draggable)
                        } else {
                            container.insertBefore(draggable, afterElement)
                        }
                    })
                })
            },

            getDragAfterElement: function (container, y) {
                const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect()
                    const offset = y - box.top - box.height / 2
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child }
                    } else {
                        return closest
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element
            }

        }
    })

new Vue({
    el: '#task_management2',
    data() {
        return {
            dragging_id: null,
            drag_over_item_id: null,
            drag_over_item_index: null,
            dragging_time: 0,
            items: [
                {
                    id: 0,
                    title: 'Item A',
                    list: 1,
                },
                {
                    id: 1,
                    title: 'Item B',
                    list: 1,
                },
                {
                    id: 2,
                    title: 'Item C',
                    list: 2,
                },
                {
                    id: 3,
                    title: 'Item AA',
                    list: 1,
                },
                {
                    id: 4,
                    title: 'Item BB',
                    list: 1,
                },
                {
                    id: 5,
                    title: 'Item CC',
                    list: 2,
                },
            ],
        }
    },
    methods: {
        startDrag(evt, item) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('itemID', item.id)
            this.dragging_id = item.id;
            setInterval(() => {
                this.dragging_time++;
            }, 1000);
        },
        onDragEnd: function(){
            document.querySelector('.placeholder')?.remove();
        },
        // onDrop(evt, list) {
        //     // const itemID = evt.dataTransfer.getData('itemID')
        //     const itemID = this.dragging_id;
        //     const item = this.items.find((item) => item.id == itemID)
        //     item.list = list
        // },
        onDrop: function (container, list) {
            const draggableElements = [...container.target.querySelectorAll('.drag-el')]
            let y = container.clientY;

            if(this.dragging_time < 2){
                return 0;
            }

            let beforeElement = draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect()
                const offset = y - box.top - box.height / 2
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child }
                } else {
                    return closest
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element

            const item = this.items.find((item) => item.id == this.dragging_id)
            item.list = list;

            if (beforeElement == null) {
                // container.appendChild(draggable)
                let last_el = null;
                
                container.currentTarget.querySelector('.drag-el:last-child')?
                last_el = container.currentTarget.querySelector('.drag-el:last-child'):
                last_el = container.target.querySelector('.drag-el:last-child')

                const itemIndex = this.items.findIndex((i) => i.id == item.id)
                
                let tempItem = {...item};
                tempItem.id = last_el ? (+last_el.dataset.id) + 1 : tempItem.id;
                
                let tempItems = [...this.items];
                tempItems.splice(itemIndex,1);
                tempItems.push(tempItem);
                this.items = [...tempItems];
                document.querySelector('.placeholder')?.remove();

            } else {
                // console.log(list);
                let beforeElementId = beforeElement.dataset.id;                
                let tempItem = {...item};

                const itemIndex = this.items.findIndex((item) => item.id == this.dragging_id)
                const beforeElementDataIndex = this.items.findIndex((item) => item.id == beforeElementId)
                
                let tempItems = [...this.items];
                tempItems.splice(itemIndex,1);
                tempItems.splice(beforeElementDataIndex,0,tempItem);
                this.items = [...tempItems];
                document.querySelector('.placeholder')?.remove();
            }
        },
        onDragOver: function (container, list) {
            const draggableElements = [...container.target.querySelectorAll('.drag-el')]
            let y = container.clientY;

            let beforeElement = draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect()
                const offset = y - box.top - box.height / 2
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child }
                } else {
                    return closest
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element

            // const item = this.items.find((item) => item.id == this.dragging_id)
            // item ? item.list = list : '';

            document.querySelector('.placeholder')?.remove();
            if (beforeElement == null) {
                container.currentTarget.insertAdjacentHTML('beforeend',"<div class='placeholder'></div>");
            } else {
                beforeElement.insertAdjacentHTML('beforebegin',"<div class='placeholder'></div>");
            }

        }
    },
    computed: {
        listOne() {
            return this.items.filter((item) => item.list === 1)
        },
        listTwo() {
            return this.items.filter((item) => item.list === 2)
        },
    },
});