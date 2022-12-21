document.getElementById("task_management") &&
	new Vue({
		el: "#task_management",
		created: function () {
			setTimeout(() => {
				this.init_draggble();
			}, 500);
		},
		methods: {
			init_draggble: function () {
				const draggables = document.querySelectorAll(".draggable");
				const containers = document.querySelectorAll(".container");
				const task_management = document.getElementById('task_management');

				let that = this;
				task_management.addEventListener('dragover',function(e){
					e.preventDefault()
					const leftOfElement = that.getDragLeftElement(task_management, e.clientX, ".container:not(.container_dragging)");

					const container_dragging = document.querySelector('.container_dragging');
					if (leftOfElement == null) {
						task_management.appendChild(container_dragging);
					} else {
						task_management.insertBefore(container_dragging, leftOfElement);
					}
				})

				draggables.forEach((draggable) => {
					draggable.addEventListener("dragstart", () => {
						draggable.classList.add("dragging");
					});

					draggable.addEventListener("dragend", () => {
						draggable.classList.remove("dragging");
					});
				});

				containers.forEach((container) => {
					container.addEventListener("dragstart", function () {
						container.classList.add("container_dragging");
					});

					container.addEventListener("dragend", function () {
						container.classList.remove("container_dragging");
					});

					const container_dragging = document.querySelector('.container_dragging');

					const draggable = document.querySelector(".dragging");
					draggable &&
						container.addEventListener("dragover", (e) => {
							e.preventDefault();
							const afterElement = this.getDragAfterElement(container, e.clientY, ".draggable:not(.dragging)");
							if (afterElement == null) {
								container.appendChild(draggable);
							} else {
								container.insertBefore(draggable, afterElement);
							}
						});
				});
			},

			getDragLeftElement: function (container, x, selector) {
				const draggableElements = [...container.querySelectorAll(selector)];

				return draggableElements.reduce(
					(closest, child) => {
						const box = child.getBoundingClientRect();
						const offset = x - box.left - box.width / 2;
						if (offset < 0 && offset > closest.offset) {
							return { offset: offset, element: child };
						} else {
							return closest;
						}
					},
					{ offset: Number.NEGATIVE_INFINITY }
				).element;
			},
			getDragAfterElement: function (container, y, selector) {
				const draggableElements = [...container.querySelectorAll(selector)];

				return draggableElements.reduce(
					(closest, child) => {
						const box = child.getBoundingClientRect();
						const offset = y - box.top - box.height / 2;
						if (offset < 0 && offset > closest.offset) {
							return { offset: offset, element: child };
						} else {
							return closest;
						}
					},
					{ offset: Number.NEGATIVE_INFINITY }
				).element;
			},
		},
	});

document.getElementById("task_management2") &&
	new Vue({
		el: "#task_management2",
		data() {
			return {
				dragging_item: {},
				dragging_item_index: null,
				dragging_item_parent: {},

				dragging_serial: null,

				drag_over_item_serial: null,
				drag_over_item_index: null,

				dragging_time: 0,
				dragging_time_end: 0.5,
				dragging_time_interval: null,

				dragging_element: null,
				dragging_mouse_x: null,
				dragging_mouse_y: null,

				items: [],

				category_dragging_item: {},
				category_dragging_id: null,
			};
		},
		created: function () {
			this.create_item();
		},
		methods: {
			create_item: function () {
				for (let category_id = 1; category_id <= 5; category_id++) {
					let item = {
						category_id: category_id,
						serial: category_id,
						title: "category-" + category_id,
						parent: 0,
						childrens: [],
					};
					for (let children = 1; children <= 5; children++) {
						item.childrens.push({
							category_id: category_id,
							title: "Item " + category_id + "-" + children,
							parent: category_id,
							serial: children,
						});
					}
					this.items.push({ ...item });
				}
				console.log(this.items);
			},
			startDrag: function (evt, item, index, parent) {
				this.dragging_element = evt.target;

				evt.dataTransfer.dropEffect = "move";
				evt.dataTransfer.effectAllowed = "move";

				this.dragging_item = item;
				this.dragging_item_index = index;
				this.dragging_item_parent = parent;

				this.dragging_serial = item.serial;

				this.dragging_time = 0;
				this.dragging_time_interval = setInterval(() => {
					this.dragging_time++;
				}, 1000);
			},
			onDragEnd: function () {
				document.querySelector(".placeholder")?.remove();
				clearInterval(this.dragging_time_interval);
			},
			onDrop: function (container, list) {
				const draggableElements = [...container.target.querySelectorAll(".drag-el")];
				let y = container.clientY;

				document.querySelector(".placeholder")?.remove();

				if (this.dragging_time < this.dragging_time_end) {
					return 0;
				}

				let beforeElement = draggableElements.reduce(
					(closest, child) => {
						const box = child.getBoundingClientRect();
						const offset = y - box.top - box.height / 2;
						if (offset < 0 && offset > closest.offset) {
							return { offset: offset, element: child };
						} else {
							return closest;
						}
					},
					{ offset: Number.NEGATIVE_INFINITY }
				).element;

				let temp_item = this.dragging_item;
				temp_item.parent = list.category_id;
				temp_item.category_id = list.category_id;
				// temp_item.title = "item-"+list.category_id+" "+(list.childrens.length+1);

				if (beforeElement == null) {
					temp_item.serial = list.childrens[list.childrens.length - 1].serial + 1;
					list.childrens.push({ ...temp_item });
					this.dragging_item_parent.childrens.splice(this.dragging_item_index, 1);
				} else {
					beforeElemenArrayIndex = beforeElement.dataset.index;
					let tempItems = [...list.childrens];

					if (JSON.stringify(tempItems) == JSON.stringify(this.dragging_item_parent.childrens)) {
						tempItems.splice(this.dragging_item_index, 1);
					} else {
						this.dragging_item_parent.childrens.splice(this.dragging_item_index, 1);
					}

					tempItems.splice(beforeElemenArrayIndex, 0, { ...temp_item });
					list.childrens = [...tempItems].map((i, k) => ({ ...i, serial: k + 1 }));
				}

				console.log(JSON.stringify(this.dragging_item));
			},
			onDragOver: function (container, list) {
				const draggableElements = [...container.target.querySelectorAll(".drag-el")];
				let y = container.clientY;

				let beforeElement = draggableElements.reduce(
					(closest, child) => {
						const box = child.getBoundingClientRect();
						const offset = y - box.top - box.height / 2;
						if (offset < 0 && offset > closest.offset) {
							return { offset: offset, element: child };
						} else {
							return closest;
						}
					},
					{ offset: Number.NEGATIVE_INFINITY }
				).element;

				document.querySelector(".placeholder")?.remove();
				if (this.dragging_time < this.dragging_time_end) {
					return 0;
				}

				if (beforeElement == null) {
					container.currentTarget.insertAdjacentHTML("beforeend", "<div class='placeholder'></div>");
				} else {
					beforeElement.insertAdjacentHTML("beforebegin", "<div class='placeholder'></div>");
				}
			},

			category_drop: function (event) {
				// console.log(event, event.target);
				console.log(this.category_dragging_item, this.category_dragging_id);
				let dragging_index = this.items.findIndex((i) => i.category_id == this.category_dragging_id);
				this.items.splice(dragging_index, 1);
				this.items[this.items.length] = { ...this.category_dragging_item };
			},
			category_drag_start: function (event, element, index) {
				this.category_dragging_item = { ...element };
				this.category_dragging_id = element.category_id;
				console.log(event, event.target, element, index);
			},
			category_drag_end: function (event, element, index) {},
		},
		computed: {
			listOne() {
				return this.items.filter((item) => item.list === 1);
			},
			listTwo() {
				return this.items.filter((item) => item.list === 2);
			},
		},
	});
