let submitBtn = document.querySelectorAll('.submit_answer')
let cardFooter = document.querySelectorAll('.card_footer')
let [main, topicWrapper, answerWrapper, bodyEl, questionWrapper, endContent, header, headerTopic] = ["main", "topics", "answers", "body", "question", "end_content", "header", "header_topic"].map(el => document.getElementById(el))
let optionLabels = {
    1: "A",
    2: "B",
    3: "C",
    4: "D"
}
//let use dynamic name, incase backend add more topic, we no need to change js code
// i try my best to not use any name/title like html/css here
// but feel bad because my object too big
let coreProcesser = {
    //user current state
    user: {
        topic: '',
        current: 1,
        total: '',
        point: 0,
        answer: '',
        correct: '',
    },

    //init data
    process: function () {
        fetch("./starter-code/data.json").then(response => {
            if (!response.ok) return false
            return response.json()
        }).then(data => {
            if (!data.quizzes) return false
            this.breakTopicData(data)
            this.populeTopic()
        })
    },
    breakTopicData: function (data) {
        //data is toobig we no need to use all of it when pick one topic
        data.quizzes.forEach(item => {
            this[`topic_item_${item.title.toLowerCase()}`] = item
        })
    },
    //topic render with dynamic data
    topicHTML: ({ title, icon }) => {
        return `
        <div tabindex="0" class="option">
          <div type = "${title.toLowerCase()}" class="img_box">
            <img src="${icon}" alt="${title}">
          </div>
          <h2>${title}</h2>
        </div>`
    },
    //question render with dynamic data
    questionHTML: (index, length, question) => {
        return `
             <span>Question <span id="current">${index}</span> of <span id="total">${length}</span></span>
            <h1> ${question}
            </h1>
            <input type="range" id="proccess" min="0" max="${length}" class="proccess">
        `
    },
    //restyle input range, fill color and percentage depend on number of answer
    questionReStyling: (index, length) => {
        let question = document.getElementById("question")
        let color = bodyEl.hasAttribute('night') ? "var(--puple)" : "var(--white)"
        let percent = (index / length) * 100;
        question.querySelector('#proccess').style.background = `linear-gradient(to right, var(--purple) ${percent}%, ${color} ${percent}%)`;
    },
    //1 answer render with dynamic data
    answerHTML: (index, answerOption) => {
        return `
         <div tabindex="0" state="none" class="option">
          <span class="option_item">${optionLabels[index]}</span>
          <h2>${answerOption.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h2>
          <div class="icon">
            <img src="./starter-code/assets/images/icon-correct.svg" class="correct" alt="">
            <img src="./starter-code/assets/images/icon-error.svg" class="error" alt="">
          </div>
        </div>`
    },
    //submit btn render with dynamic state (error , submit, nex question, play again)
    submitBtn: (state, text) => {
        return `
          <div tabindex="0" state="${state}" class="submit_answer">
            ${text}
          </div>
          <span><img src="./starter-code/assets/images/icon-error.svg" alt="">Please select an answer</span>
        `
    },
    headerTopicHTML: function () {
        return `<div type="${this.user.topic}" class="img_box">
          <img src="${this[`topic_item_${this.user.topic}`].icon}" alt="${this.user.topic}">
        </div>
        <span>${this[`topic_item_${this.user.topic}`].title}</span>
      </div>`
    },
    endGameHTML: function () {
        return `<div class="topic_type">
      ${this.headerTopicHTML()}
      <h2 class="scored">${this.user.point}</h2>
      <span class="total_scrored">out of ${this.user.total}</span>`
    },
    populeSubmitBtn: function (state, text) {
        cardFooter.forEach(el => {
            el.innerHTML = ''
            el.insertAdjacentHTML('beforeend', this.submitBtn(state, text))
        })
    },
    //render topics
    populeTopic: function () {
        header.toggleAttribute('topic', true)
        topicWrapper.innerHTML = ""
        for (const key in this) {
            if (!Object.prototype.hasOwnProperty.call(this, key)) continue
            if (!key.includes("topic_item_")) continue
            topicWrapper.insertAdjacentHTML("beforeend", this.topicHTML(this[key]))
        }
    },
    //render question
    populeQuestion: function () {
        let questions = this[`topic_item_${this.user.topic}`].questions
        if (!questions) return false
        let currentIndex = this.user.current
        let length = questions.length
        let question = questions[currentIndex]?.question ?? ''
        let answer = questions[currentIndex]?.answer ?? ''
        let answerOptions = questions[currentIndex]?.options ?? []
        questionWrapper.innerHTML = ""
        questionWrapper.insertAdjacentHTML("beforeend", this.questionHTML(currentIndex, length, question))
        this.questionReStyling(currentIndex, length)
        this.user.correct = answer
        this.user.total = length
        this.populateAnswer(answerOptions)
        header.toggleAttribute('topic', false)
        headerTopic.innerHTML = ""
        headerTopic.insertAdjacentHTML('beforeend' , this.headerTopicHTML())

    },
    //render answer and submit btn
    populateAnswer: function (answerOptions) {
        answerWrapper.innerHTML = ""
        answerOptions?.forEach((answerOption, index) => {
            answerWrapper.insertAdjacentHTML("beforeend", this.answerHTML(index + 1, answerOption))
        })
        this.populeSubmitBtn("waiting_submit", "Submit Answer")
    },
    //render endgame screen

    checkAnswer: function () {
        return this.user.answer == this.user.correct
    },
    checkLastQuestion: function () {
        return this.user.current >= this.user.total
    },
    checkIfChosen: function () {
        return this.user.answer && this.user.correct

    },
    resetQuestionData: function () {
        this.user.answer = ""
        this.user.correct = ""
    },
    resetUserData: function () {
        this.user = {
            topic: '',
            current: 1,
            total: 1,
            point: 0,
            answer: '',
            correct: '',
        }
    },

    handleWrongAnswer: function () {
        answerWrapper.querySelectorAll('.option')?.forEach(el => {
            let textContent = el.querySelector("h2").textContent ?? ''
            if (textContent == this.user.correct) el.setAttribute('state', 're_correct')
            if (textContent == this.user.answer) el.setAttribute('state', 'in_correct')
            el.style = "pointer-events: none;"
        })
        this.populeSubmitBtn("next_question", "Next Question")
    },
    hanldeCorrectAnswer: function () {
        answerWrapper.querySelectorAll('.option')?.forEach(el => {
            let textContent = el.querySelector("h2").textContent ?? ''
            if (textContent == this.user.correct) el.setAttribute('state', 'correct')
            el.style = "pointer-events: none;"
        })
        this.user.point += 1
        this.populeSubmitBtn("next_question", "Next Question")
    },
    handleNextQuestion: function () {
        this.resetQuestionData()
        this.user.current += 1
        if (this.checkLastQuestion()) {
            this.endGame();
            return false
        }
        this.populeQuestion()
    },
    handlePlayAgain: function () {
        main.setAttribute('type', 'topic')
        this.populeTopic()
    },
    endGame: function () {
        this.populeSubmitBtn("play_again", "Play Again")
        main.setAttribute('type', 'submit')
        endContent.innerHTML = ""
        endContent.insertAdjacentHTML('beforeend', this.endGameHTML())
        console.log(this.endGameHTML());

        this.resetUserData()
    },
}
coreProcesser.process()
let handlePickTopic = (e) => {
    let option = e.target.closest('.option')
    let topic = option.querySelector(".img_box")?.getAttribute('type')
    if (!option || !topic) return false
    main.setAttribute('type', 'answer')
    coreProcesser.user.topic = topic
    coreProcesser.populeQuestion()
}
let handleAnswer = (e) => {
    let answer = e.target.closest('.option')
    if (!answer) return false
    if (answer.getAttribute('state') == "selected") {
        answer.setAttribute('state', 'none')
        return false
    }
    answerWrapper.querySelectorAll('.option')?.forEach(el => el.setAttribute('state', 'none'))
    answer.setAttribute("state", "selected")
    coreProcesser.user.answer = answer.querySelector("h2").textContent ?? ''
}
let handleSubmitState = {
    waiting_submit: function () {
        if (!coreProcesser.checkIfChosen()) {
            coreProcesser.populeSubmitBtn('error', 'Submit Answer')
            return false;
        }
        coreProcesser.checkAnswer() ? coreProcesser.hanldeCorrectAnswer() : coreProcesser.handleWrongAnswer()
    },

    error: function () {
        if (!coreProcesser.checkIfChosen()) {
            coreProcesser.populeSubmitBtn('error', 'Submit Answer')
            return false;
        }
        coreProcesser.checkAnswer() ? coreProcesser.hanldeCorrectAnswer() : coreProcesser.handleWrongAnswer()
    },

    next_question: function () {
        coreProcesser.handleNextQuestion()
    },

    play_again: function () {
        coreProcesser.handlePlayAgain()
    }
}
let handleSubmit = (e) => {
    let state = e.target.getAttribute("state")
    if (!state) return false
    handleSubmitState[state]()
}
topicWrapper.addEventListener('click', handlePickTopic)
answerWrapper.addEventListener('click', handleAnswer)
cardFooter.forEach((el) => el.addEventListener('click', handleSubmit))
