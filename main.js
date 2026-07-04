let taskArray = []
let taskArrayOld = []
let categories = []
let categoriesOld = []
let taskElements = []
let tasksDisplayed = []
const taskEditDiv = document.querySelector('div.taskEdit')

function makeTaskDivs() {
	const output = new Promise((resolve) => {
		queryDatabase('taskList').then(function (value) {
			taskArray = value.split('&rowEnd&')
			if (!arrayEquals(taskArrayOld, taskArray)) {
				taskArrayOld = value.split('&rowEnd&')
				document.querySelector('.taskList').innerHTML = ''
				taskElements = []
				for (let i = 0; i < taskArray.length; i++) {
					taskArray[i] = taskArray[i].split('&colEnd&')
					let taskDivEl = document.createElement('div')
					taskDivEl.classList.add('taskDiv')
					taskDivEl.id = taskArray[i][0]

					let taskDoneDivEl = document.createElement('div')
					taskDoneDivEl.classList.add('taskDone', 'disableFilter')
					let taskDoneEl = document.createElement('input')
					taskDoneEl.setAttribute('type', 'checkbox')
					if (taskArray[i][4] == '1') {
						taskDoneEl.setAttribute('checked', '')
					}
					taskDoneDivEl.appendChild(taskDoneEl)
					taskDivEl.appendChild(taskDoneDivEl)

					let taskNameDivEl = document.createElement('div')
					taskNameDivEl.classList.add('taskName')
					let taskNameEl = document.createElement('h3')
					taskNameEl.innerText = taskArray[i][1]
					taskNameDivEl.appendChild(taskNameEl)
					taskDivEl.appendChild(taskNameDivEl)

					let taskCategoryDivEl = document.createElement('div')
					taskCategoryDivEl.classList.add('taskCategory', 'disableFilter')
					let taskCategoryEl = document.createElement('h4')
					taskCategoryEl.innerText = taskArray[i][8]
					taskCategoryDivEl.appendChild(taskCategoryEl)
					taskDivEl.appendChild(taskCategoryDivEl)

					let taskDeadlineDivEl = document.createElement('div')
					taskDeadlineDivEl.classList.add('taskDeadline')
					let taskDeadlineEl = document.createElement('p')
					taskDeadlineEl.innerText = taskArray[i][6]
					taskDeadlineDivEl.appendChild(taskDeadlineEl)
					taskDivEl.appendChild(taskDeadlineDivEl)

					let taskInteraction = document.createElement('div')
					taskInteraction.classList.add('taskInteraction', 'disableFilter')
					let view = document.createElement('button')
					view.classList.add('view')
					view.innerText = 'view'
					let more = document.createElement('button')
					more.classList.add('more')
					more.innerText = 'more'
					let del = document.createElement('button')
					del.classList.add('delete')
					del.innerText = 'delete'
					taskInteraction.append(view, more, del)
					taskDivEl.appendChild(taskInteraction)

					let taskDescriptionDivEl = document.createElement('div')
					taskDescriptionDivEl.classList.add('taskDescription')
					let taskDescriptionEl = document.createElement('p')
					taskDescriptionEl.innerText = taskArray[i][3]
					taskDescriptionDivEl.appendChild(taskDescriptionEl)
					taskDivEl.appendChild(taskDescriptionDivEl)

					taskElements[taskElements.length] = taskDivEl
				}
			}
			resolve()
		})
	})
	return output
}

function makeCategories() {
	const output = new Promise((resolve) => {
		queryDatabase('categories').then(function (value) {
			let tempCategoryArray = value.split('&rowEnd&')
			if (!arrayEquals(tempCategoryArray, categoriesOld)) {
				categoriesOld = value.split('&rowEnd&')
				document.querySelector('div.categoryFilter div.input').innerHTML = ''
				document.querySelector('div.taskEdit div.taskCategory select').innerHTML = ''
				categories = []
				for (let i = 0; i < tempCategoryArray.length; i++) {
					tempCategoryArray[i] = tempCategoryArray[i].split('&colEnd&')
					categories[tempCategoryArray[i][0]] = tempCategoryArray[i][1]
				}
				categories.forEach(function (value, key, array) {
					let catLabel = document.createElement('label')
					let catInput = document.createElement('input')
					catInput.setAttribute('type', 'checkbox')
					catInput.toggleAttribute('checked')
					catLabel.appendChild(catInput)
					catLabel.innerHTML += value
					document.querySelector('div.categoryFilter div.input').appendChild(catLabel)

					let selectEl = document.createElement('option')
					selectEl.value = key
					selectEl.innerText = value
					document.querySelector('div.taskEdit div.taskCategory select').appendChild(selectEl)
				})
				resolve()
			}
		})
	})
	return output
}

function queryDatabase(query) {
	const output = new Promise((resolve) => {
		const xhttp = new XMLHttpRequest();
		xhttp.open('GET', `queryDatabase.php?query=${query}`, true)
		xhttp.onload = function () {
			resolve(this.response)
		}
		xhttp.send()
	})
	return output
}

function displayTasks() {
	const taskList = document.querySelector('div.taskList')
	tasksDisplayed = []
	while (taskList.childElementCount != 0) {
		taskList.removeChild(taskList.children[0])
	}
	let filterArray = []
	let filterEl = document.querySelector('div.categoryFilter').querySelector('div.input').children
	let exactSearch = document.querySelector('div.regexFilter input[type="checkbox"]#exactSearch').checked
	let regexFilter = document.querySelector('div.regexFilter input[type="text"]#regex').value
	let regexFilterHighlight = ''
	let regexFilterTest
	let regexFilterSplit = regexFilter.trim().split(/(?<!\\) /gm)
	let regexMatched = false
	let temp = ''
	for (let i = 0; i < filterEl.length; i++) {
		filterArray[filterEl[i].innerText] = filterEl[i].querySelector('input').checked
	}
	if (exactSearch && regexFilter != '') {
		regexFilterHighlight = new RegExp(String.raw`(${regexFilter})`, 'gm')
		regexFilterTest = new RegExp(String.raw`${regexFilter}`, 'm')
	} else if ((!exactSearch) && regexFilter != '') {
		regexFilterHighlight = ''
		regexFilterTest = ''
		for (let i = 0; i < regexFilterSplit.length; i++) {
			regexFilterTest += `(?=.*${regexFilterSplit[i]})`
			if (regexFilterHighlight.length != 0) {
				regexFilterHighlight += '|'
			}
			regexFilterHighlight += regexFilterSplit[i]
		}
		regexFilterTest = new RegExp(String.raw`^${regexFilterTest}`, 'gm')
		regexFilterHighlight = new RegExp(String.raw`(${regexFilterHighlight})`, 'gm')
	}
	for (let i = 0; i < taskElements.length; i++) {
		if (regexFilter != '') {
			for (let j = 0; j < taskElements[i].children.length; j++) {
				if (!taskElements[i].children[j].classList.contains('disableFilter')) {
					temp += taskElements[i].children[j].innerText
				}
			}
			regexMatched = regexFilterTest.test(temp)
		}
		if (filterArray[taskElements[i].querySelector('div.taskCategory h4').innerText] && ((regexFilter == '') ? true : regexMatched) && (((document.querySelector('#complited').checked) ? taskElements[i].querySelector('.taskDone input').checked : false) || ((document.querySelector('#nComplited').checked) ? !taskElements[i].querySelector('.taskDone input').checked : false))) {
			taskElements[i].innerHTML = taskElements[i].innerHTML.replaceAll(/<span class="highlight">(.*?)<\/span>/gm, '$1')
			taskList.appendChild(taskElements[i])
			tasksDisplayed[i] = taskElements[i]
			if (regexFilter != '' && regexMatched) {
				for (let j = 0; j < taskElements[i].children.length; j++) {
					if (taskElements[i].children[j].classList.contains('disableFilter')) {
						continue
					} else {
						taskElements[i].children[j].children[0].innerHTML = taskElements[i].children[j].children[0].innerHTML.replaceAll(regexFilterHighlight, '<span class="highlight">$1</span>')
					}
				}
			}
		}
	}

}

function taskInteractions(clickEvent) {
	switch (true) {
		case (clickEvent.target.tagName === 'BUTTON' && clickEvent.target.classList.contains('more')):
			if (clickEvent.target.parentElement.parentElement.querySelector('div.taskDescription > p').scrollHeight + 10 + 21 > 75) {
				if (getComputedStyle(clickEvent.target.parentElement.parentElement).height == '75px') {
					clickEvent.target.parentElement.parentElement.style.height = clickEvent.target.parentElement.parentElement.querySelector('div.taskDescription > p').scrollHeight - clickEvent.target.parentElement.parentElement.querySelector('div.taskDescription').clientHeight + 75 + 'px'
				} else {
					clickEvent.target.parentElement.parentElement.style.height = '75px'
				}
			}
			break;

		case (clickEvent.target.tagName === 'BUTTON' && clickEvent.target.classList.contains('view')):
			taskViewEdit(clickEvent.target.parentElement.parentElement)
			break;

		case (clickEvent.target.tagName === 'BUTTON' && clickEvent.target.classList.contains('delete')):
			taskDelete(clickEvent.target.parentElement.parentElement)
			break;

		case (clickEvent.target.tagName === 'INPUT' && clickEvent.target.type === 'checkbox' && clickEvent.target.parentElement.classList.contains('taskDone')):
			taskDoneUpdate(clickEvent.target.parentElement.parentElement, clickEvent.target.checked)
			break;

		default:
			break;
	}
	console.log()
}

function taskDelete(taskElement) {
	if (confirm('are you sure?')) {
		console.log('Preeeetyyy sure...')
		console.log('threw a thrash bag...')
		console.log('into space...')
		console.log(taskElement.id)
		queryDatabase('taskDelete&id=' + taskElement.id).then(function (value) {
			refresh()
		})
	}
}

function taskDoneUpdate(taskElement, done = true) {
	queryDatabase(`taskDone&id=${taskElement.id}&done=${done}`).then(function (value) {
		refresh()
	})
}

function arrayEquals(array1 = [], array2 = []) {
	if (array1 == null || array2 == null) { return false }
	if (array1.length != array2.length) { return false }

	for (let i = 0; i < array1.length; i++) {
		if (array1[i] != array2[i]) { return false }
	}
	return true
}

function editButton() {
	$('div.taskEdit input, div.taskEdit textarea, div.taskEdit select, button.save').show()
	$('div.taskEdit > div > :not(input, textarea, select, button, label), button.edit').hide()
}

function editClose() {
	document.querySelector('div.taskEdit').style.transform = "scale(0)"
}

function taskViewEdit(taskEl = 'unset') {
	document.querySelector('div.taskEdit').style.transform = "scale(1)"
	let tempClassArray = [
		'taskName',
		'taskCategory',
		'taskDeadline',
		'taskDescription',
		'taskId',
		'taskDone'
	]
	const taskChosen = taskEl !== 'unset'
	for (let i = 0; i < tempClassArray.length; i++) {
		if (tempClassArray[i] != 'taskDone' && tempClassArray[i] != 'taskId') {
			taskEditDiv.querySelector(`div.${tempClassArray[i]} *`).innerText = (taskChosen) ? taskEl.querySelector(`div.${tempClassArray[i]} *`).innerText : '';
		}
		switch (taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).tagName) {
			case 'TEXTAREA':
				taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).value = (taskChosen) ? taskEl.querySelector(`div.${tempClassArray[i]} *`).innerText : '';
				break;

			case 'SELECT':
				taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).value = (taskChosen) ? categories.indexOf(taskEl.querySelector(`div.${tempClassArray[i]} *`).innerText) : '-1';
				break;

			case 'INPUT':
				switch (taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).type) {
					case 'text':
						taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).value = (taskChosen) ? taskEl.querySelector(`div.${tempClassArray[i]} *`).innerText : '';
						break;

					case 'datetime-local':
						taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).value = (taskChosen) ? taskEl.querySelector(`div.${tempClassArray[i]} *`).innerText.trim().split(' ').join('T').substring(0, 16) : '';
						break;

					case 'checkbox':
						taskEditDiv.querySelector(`div.${tempClassArray[i]} input[type="checkbox"]`).checked = (taskChosen) ? taskEl.querySelector(`div.${tempClassArray[i]} input[type="checkbox"]`).checked : false;

					case 'hidden':
						taskEditDiv.querySelector(`div.${tempClassArray[i]} :last-child`).value = (taskChosen) ? taskEl.id : '';
						break;

					default:
						break;
				}
			default:
				break;
		}
	}
	if (taskChosen) {
		$('div.taskEdit input, div.taskEdit textarea, div.taskEdit select, button.save').hide()
		$('div.taskEdit > div > :not(input, textarea, select, button), button.edit').show()
	} else {
		$('div.taskEdit input, div.taskEdit textarea, div.taskEdit select, button.save').show()
		$('div.taskEdit > div > :not(input, textarea, select, button), button.edit').hide()
	}
}

function editSave() {
	queryDatabase(`insertTask&id=${taskEditDiv.querySelector('input[type="hidden"]').value}&name=${taskEditDiv.querySelector('.taskName input').value}&category=${taskEditDiv.querySelector('.taskCategory select').value}&deadline=${taskEditDiv.querySelector('.taskDeadline input').value}&description=${taskEditDiv.querySelector('.taskDescription textarea').value}&done=${taskEditDiv.querySelector('.taskDone input').checked}`).then(
		function (value) {
			refresh()
			editClose()
		}
	)
}

function refresh(categoriesRefresh = false) {
	makeTaskDivs().then(function (value) {
		if (categoriesRefresh) {
			makeCategories().then(function (value) {
				displayTasks()
			})
		} else {
			displayTasks()
		}
	})
}

function testowanie() {
	console.log('triggered')
}

document.querySelector('div.taskFilter').addEventListener('click', displayTasks)
document.querySelector('input#regex').addEventListener('input', displayTasks)
document.querySelector('input#exactSearch').addEventListener('change', displayTasks)
document.querySelector('div.taskList').addEventListener('click', function () { taskInteractions(event) })
document.querySelector('div.taskEdit > div.taskInteraction > .edit').addEventListener('click', editButton)
document.querySelector('div.taskEdit button.close').addEventListener('click', editClose)
document.querySelector('button.add').addEventListener('click', function () { taskViewEdit() })
document.querySelector('button.save').addEventListener('click', editSave)

makeTaskDivs().then(function (value) {
	makeCategories().then(function (value) {
		displayTasks()
	})
})

setInterval(function () {
	refresh(1)
}, 10000)