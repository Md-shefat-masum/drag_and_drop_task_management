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
            ],
        }
    },
    methods: {
        startDrag(evt, item) {
            evt.dataTransfer.dropEffect = 'move'
            evt.dataTransfer.effectAllowed = 'move'
            evt.dataTransfer.setData('itemID', item.id)
            this.dragging_id = item.id;
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

            let afterElement = draggableElements.reduce((closest, child) => {
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

            if (afterElement == null) {
                // container.appendChild(draggable)
            } else {
                // console.log(list);
                let afterElementId = afterElement.dataset.id;                
                let tempItem = {...item};

                const afterElementData = this.items.find((item) => item.id == afterElementId)
                let tempafterElementData = {...afterElementData};

                const itemIndex = this.items.findIndex((item) => item.id == this.dragging_id)
                const afterElementDataIndex = this.items.findIndex((item) => item.id == afterElementId)
                
                let tempItems = [...this.items];
                tempItem.id = afterElementData.id;
                tempafterElementData.id = item.id;
                tempItems[afterElementDataIndex] = tempItem;
                tempItems[itemIndex] = tempafterElementData;

                this.items = [...tempItems];
                // container.insertBefore(draggable, afterElement)
            }
            document.querySelector('.placeholder')?.remove();
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

            const item = this.items.find((item) => item.id == this.dragging_id)
            item.list = list;

            document.querySelector('.placeholder')?.remove();
            if (beforeElement == null) {
                // container.appendChild(draggable)
            } else {
                // console.log(list);
                beforeElement.insertAdjacentHTML('beforebegin',"<div class='placeholder'></div>");
                // container.target.insertBefore("<h1>sfda</h1>", beforeElement)
                console.log(beforeElement);
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