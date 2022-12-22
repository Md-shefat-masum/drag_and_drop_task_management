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
				const container_draggable = document.querySelectorAll("container_draggable");
				const containers = document.querySelectorAll(".container");
				const task_management = document.getElementById("task_management");

				let that = this;
				task_management.addEventListener("dragover", function (e) {
					e.preventDefault();

					const container_dragging = document.querySelector(".container_dragging");
					if (container_dragging) {
						const leftOfElement = that.getDragLeftElement(task_management, e.clientX, ".container:not(.container_dragging)");
						if (leftOfElement == null) {
							task_management.appendChild(container_dragging);
						} else {
							task_management.insertBefore(container_dragging, leftOfElement);
						}
					}
				});

				draggables.forEach((draggable) => {
					draggable.addEventListener("dragstart", () => {
						draggable.classList.add("dragging");
					});

					draggable.addEventListener("dragend", () => {
						draggable.classList.remove("dragging");
					});
				});

				container_draggable.forEach((draggable) => {
					draggable.addEventListener("dragstart", () => {
						draggable.parentNode.classList.add("container_dragging");
					});

					draggable.addEventListener("dragend", () => {
						draggable.parentNode.classList.remove("container_dragging");
					});
				});

				containers.forEach((container) => {
					container.addEventListener("dragstart", () => {
						!document.querySelector(".dragging") && container.classList.add("container_dragging");
					});

					container.addEventListener("dragend", () => {
						!document.querySelector(".dragging") && container.classList.remove("container_dragging");
					});

					container.addEventListener("dragover", (e) => {
						e.preventDefault();
						const draggable = document.querySelector(".dragging");
						if (draggable) {
							const afterElement = this.getDragAfterElement(container, e.clientY, ".draggable:not(.dragging)");
							if (afterElement == null) {
								container.appendChild(draggable);
							} else {
								container.insertBefore(draggable, afterElement);
							}
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

document.getElementById("task_management3") &&
	new Vue({
		el: "#task_management3",
		data: function () {
			return {
				container_dragging_el: null,
				container_dragging_el_details: null,
				leftOfElementIndex: null,

				item_dragging_el: null,
				item_index: null,
				item_parent_index: null,
				item_dropping_before_el_index: null,
				item_dropping_before_el_parent_index: null,

				items: [],
			};
		},
		created: function () {
			this.create_item();
		},
		methods: {
			create_item: function () {
				for (let category_id = 1; category_id <= 5; category_id++) {
					let item = {
						id: category_id,
						serial: category_id,
						title: "category-" + category_id,
						parent: 0,
						childrens: [],
					};
					for (let children_id = 6; children_id <= 10; children_id++) {
						item.childrens.push({
							id: children_id,
							serial: children_id,
							title: "Item " + category_id + "-" + children_id,
							parent: category_id,
							childrens: [],
						});
					}
					this.items.push({ ...item });
				}
				console.log(this.items);
			},
			wrapper_drag_over: function (event) {
				let that = this;
				const task_management = event.currentTarget;

				if (this.container_dragging_el) {
					// const leftOfElement = that.getDragLeftElement(task_management, event.clientX, ".container:not(.container_dragging)");
					const leftOfElement = that.getDragLeftElement(task_management, event.clientX, ".container");
					document.querySelector(".placeholder")?.remove();
					if (leftOfElement == null) {
						// task_management.appendChild(this.container_dragging_el);
						this.leftOfElementIndex = this.items.length - 1;
						task_management.insertAdjacentHTML("beforeend", "<div class='placeholder'></div>");
					} else {
						// task_management.insertBefore(this.container_dragging_el, leftOfElement);
						this.leftOfElementIndex = leftOfElement.dataset.index;
						leftOfElement.insertAdjacentHTML("beforebegin", "<div class='placeholder'></div>");
					}
				}
			},
			container_dragging_start: function (event, item) {
				if (!this.item_dragging_el) {
					this.container_dragging_el = event.currentTarget;
					event.currentTarget.classList.add("container_dragging");
					this.container_dragging_el_details = item;
				}
			},
			container_dragging_end: function (event) {
				this.container_dragging_el = null;
				!this.item_dragging_el && document.querySelector(".placeholder")?.remove();
				!this.item_dragging_el && event.currentTarget.classList.remove("container_dragging");
			},
			container_dragging_drop: function () {
				let items = [...this.items];

				if (this.container_dragging_el) {
					let item = { ...this.container_dragging_el_details };
					let category_index = this.items.findIndex((i) => i.id == item.id);

					items.splice(category_index, 1);
					items.splice(this.leftOfElementIndex, 0, { ...item });
					this.items = [...items];

					let task_index = [];
					items.forEach((el, index) => {
						task_index.push({
							task_id: el.id,
							serial: index,
						});
					});
					console.log(task_index);
				}

				if (this.item_dragging_el) {
					// console.log(
					// 	this.item_index,
					// 	this.item_parent_index,
					// 	this.item_dropping_before_el_parent_index,
					// 	this.item_dropping_before_el_index
					// );
					let item_list = items[this.item_parent_index].childrens;
					let item = { ...item_list[this.item_index] };
					item_list.splice(this.item_index, 1);

					if (this.item_dropping_before_el_parent_index) {
						let target_list = items[this.item_dropping_before_el_parent_index];
						if (this.item_dropping_before_el_index) {
							target_list.childrens.splice(this.item_dropping_before_el_index, 0, { ...item });
						} else {
							target_list.childrens.push({ ...item });
						}
						let sub_task_index = [];
						target_list.childrens.forEach((el, index) => {
							sub_task_index.push({
								task_id: el.parent,
								sub_task_id: el.id,
								serial: index,
							});
						});
						console.log(sub_task_index);
					} else {
						item_list.push({ ...item });
					}
					this.items = [...items];

					let sub_task_index = [];
					item_list.forEach((el, index) => {
						sub_task_index.push({
							task_id: el.parent,
							sub_task_id: el.id,
							serial: index,
						});
					});
					console.log(sub_task_index);
					this.item_dragging_el = null;
				}

				document.querySelector(".placeholder")?.remove();
			},
			container_dragging_over: function (event) {
				const container = event.currentTarget;
				this.item_dropping_before_el_parent_index = null;

				if (this.item_dragging_el) {
					const afterElement = this.getDragAfterElement(container, event.clientY, ".draggable:not(.dragging)");
					document.querySelector(".placeholder")?.remove();

					this.item_dropping_before_el_parent_index = container.dataset.index;
					if (afterElement == null) {
						// container.appendChild(this.item_dragging_el);
						this.item_dropping_before_el_index = null;
						container.insertAdjacentHTML("beforeend", "<div class='placeholder'></div>");
					} else {
						this.item_dropping_before_el_index = afterElement.dataset.index;
						afterElement.insertAdjacentHTML("beforebegin", "<div draggable class='placeholder'></div>");
						// container.insertBefore(this.item_dragging_el, afterElement);
					}
				}
			},

			item_dragging_start: function (event, parent_index, item_index) {
				this.item_dragging_el = event.currentTarget;
				this.item_parent_index = parent_index;
				this.item_index = item_index;
				event.currentTarget.classList.add("dragging");
			},
			item_dragging_end: function (event) {
				this.item_dragging_el = null;
				event.currentTarget.classList.remove("dragging");
				document.querySelector(".placeholder")?.remove();
			},

			item_dragging_drop: function () {
				// console.log(this.item_parent_index, this.item_index);
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
