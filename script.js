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
            dragging_serial: null,
            drag_over_item_serial: null,
            drag_over_item_index: null,
            dragging_time: 0,
            dragging_time_end: 2,
            items: [
                {
                    serial: 0,
                    title: 'Item A',
                    list: 1,
                },
                {
                    serial: 1,
                    title: 'Item B',
                    list: 1,
                },
                {
                    serial: 2,
                    title: 'Item C',
                    list: 2,
                },
                {
                    serial: 3,
                    title: 'Item AA',
                    list: 1,
                },
                {
                    serial: 4,
                    title: 'Item BB',
                    list: 1,
                },
                {
                    serial: 5,
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
            evt.dataTransfer.setData('itemserial', item.serial)
            this.dragging_serial = item.serial;
            this.dragging_time = 0;
            setInterval(() => {
                this.dragging_time++;
            }, 1000);
        },
        onDragEnd: function(){
            document.querySelector('.placeholder')?.remove();
        },
        // onDrop(evt, list) {
        //     // const itemserial = evt.dataTransfer.getData('itemserial')
        //     const itemserial = this.dragging_serial;
        //     const item = this.items.find((item) => item.serial == itemserial)
        //     item.list = list
        // },
        onDrop: function (container, list) {
            const draggableElements = [...container.target.querySelectorAll('.drag-el')]
            let y = container.clientY;

            document.querySelector('.placeholder')?.remove();

            if(this.dragging_time < this.dragging_time_end){
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

            const item = this.items.find((item) => item.serial == this.dragging_serial)
            item.list = list;

            if (beforeElement == null) {
                // container.appendChild(draggable)
                let last_el = null;
                
                container.currentTarget.querySelector('.drag-el:last-child')?
                last_el = container.currentTarget.querySelector('.drag-el:last-child'):
                last_el = container.target.querySelector('.drag-el:last-child')

                const itemIndex = this.items.findIndex((i) => i.serial == item.serial)
                
                let tempItem = {...item};
                tempItem.serial = last_el ? (+last_el.dataset.serial) + 1 : tempItem.serial;
                
                let tempItems = [...this.items];
                tempItems.splice(itemIndex,1);
                tempItems.push(tempItem);
                this.items = [...tempItems];

            } else {            
                let tempItem = {...item};

                const itemIndex = this.items.findIndex((item) => item.id == this.dragging_id)
                const beforeElementDataIndex = this.items.findIndex((item) => item.id == beforeElementId)
                
                let tempItems = [...this.items];
                tempItems.splice(itemIndex,1);
                tempItems.splice(beforeElementDataIndex,0,tempItem);
                this.items = [...tempItems];
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

            document.querySelector('.placeholder')?.remove();
            if(this.dragging_time < this.dragging_time_end){
                return 0;
            }

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