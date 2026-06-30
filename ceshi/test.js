// ======================用户ID相关函数======================
function bindShowIdButton(){
    const idBtn = document.getElementById('showMyIdBtn');
    if(idBtn){
        idBtn.addEventListener('click', async ()=>{
            try {
                // 自动复制到剪贴板
                await navigator.clipboard.writeText(userLocalId);
                alert(`你的本机专属解锁ID：\n${userLocalId}\n\n✅ 已自动复制到剪贴板\n发送给管理员加入白名单可直接解锁全部题库`);
            } catch (e) {
                // 复制失败降级为普通弹窗
                alert(`你的本机专属解锁ID：\n${userLocalId}\n发送给管理员加入白名单可直接解锁全部题库`);
            }
        })
    }
}

// ======================判断题渲染======================
function renderJudgeQuestions() {
    const container = document.getElementById('judge-questions');
    container.innerHTML = '';
    if (!currentExamData.judgeQuestions) return;
    let questions = currentExamData.judgeQuestions;
    const judgeOptions = ["√ 正确", "× 错误"];
    questions = shuffleIfRandom(questions);
    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.dataset.questionId = q.id;
        const header = document.createElement('div');
        header.className = 'question-header';
        const questionText = document.createElement('div');
        questionText.className = 'question-text';
        questionText.innerHTML = `${index + 1}. ${q.question}`;
        header.appendChild(questionText);
        const errorId = `judge-${q.id}`;
        const errorCount = errorCounts[errorId] || 0;
        const errorDisplay = document.createElement('span');
        errorDisplay.className = 'error-count-display';
        errorDisplay.dataset.errorId = errorId;
        if (errorCount > 0) {
            errorDisplay.textContent = `❌ 错误 ${errorCount} 次`;
        } else {
            errorDisplay.style.display = 'none';
        }
        header.appendChild(errorDisplay);
        questionDiv.appendChild(header);
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';
        // 判断题选项固定顺序，不随机打乱
        const options = judgeOptions;
        options.forEach((option, optIndex) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            const isThisOptionTrue = option.startsWith('√');
            optionDiv.dataset.correct = (isThisOptionTrue === q.answer);
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `judge-${q.id}`;
            radio.id = `judge-${q.id}-opt${optIndex}`;
            const label = document.createElement('label');
            label.htmlFor = `judge-${q.id}-opt${optIndex}`;
            label.textContent = ` ${option}`;
            const feedback = document.createElement('span');
            feedback.className = 'feedback';
            optionDiv.appendChild(radio);
            optionDiv.appendChild(label);
            optionDiv.appendChild(feedback);
            optionDiv.addEventListener('click', function() {
                if (questionDiv.classList.contains('answered')) return;
                questionDiv.classList.add('answered');
                optionsDiv.querySelectorAll('.option').forEach(opt => {
                    opt.classList.add('answered');
                    opt.querySelector('input').disabled = true;
                });
                const isCorrect = this.dataset.correct === 'true';
                const allOptions = this.parentElement.querySelectorAll('.option');
                allOptions.forEach(opt => {
                    opt.classList.remove('selected', 'wrong');
                    opt.querySelector('.feedback').textContent = '';
                });
                if (isCorrect) {
                    this.classList.add('selected');
                    this.querySelector('.feedback').textContent = '✓ 正确';
                    this.querySelector('.feedback').className = 'feedback correct-feedback';
                    checkZhaoYuPerfectScore();
                } else {
                    incrementError(errorId);
                    this.classList.add('wrong');
                    this.querySelector('.feedback').textContent = '✗ 错误';
                    this.querySelector('.feedback').className = 'feedback wrong-feedback';
                    allOptions.forEach(opt => {
                        const optIsTrue = opt.querySelector('label').textContent.includes('√');
                        if (optIsTrue === q.answer) {
                            opt.classList.add('selected');
                            opt.querySelector('.feedback').textContent = '✓ 正确答案';
                            opt.querySelector('.feedback').className = 'feedback correct-feedback';
                        }
                    });
                    handleZhaoYuWrongAnswer();
                }
            });
            optionsDiv.appendChild(optionDiv);
        });
        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

// ======================返回顶部功能======================
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function() {
    const backBtn = document.getElementById('backToTopBtn');
    if (backBtn) {
        if (window.scrollY > 300) {
            backBtn.style.opacity = '1';
            backBtn.style.pointerEvents = 'auto';
        } else {
            backBtn.style.opacity = '0';
            backBtn.style.pointerEvents = 'none';
        }
    }
});
