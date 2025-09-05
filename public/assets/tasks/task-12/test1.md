## <u>Solution to Question 1</u>

#### Notation

Let us represent the situation with a Venn diagram, with the following labels:

- $R$ : students who play badminton
- $G$ : students who play basketball
- $B$ : students who play table tennis

The overlapped areas correspond to students who play more than 1 game.

<div class="video-container">
  <video autoplay muted playsinline>
      <source src="{{ mediaUrl }}Scene1.webm" type="video/webm">
      Your browser does not support the video tag.
  </video>
  <button class="replay-btn" aria-label="Replay">⟳</button>
</div>

#### Read from Information + Deduction

It is given that

- Percentage of students who play badminton = 75%
- Percentage of students who play basketball = 70%
- Percentage of students who play table tennis = 65%

This implies that

- Percentage of students who **do not** play badminton = 25%
- Percentage of students who **do not** basketball = 30%
- Percentage of students who **do not** table tennis = 35%


<div class="video-container">
  <video autoplay muted playsinline>
      <source src="assets/tasks/task-12/Scene2.webm" type="video/webm">
      Your browser does not support the video tag.
  </video>
  <button class="replay-btn" aria-label="Replay">⟳</button>
</div>

#### Reasoning - Cover all cases

These groups of students:

   * 25% do not play badminton
   * 30% do not play basketball
   * 35% do not play table tennis
   * x% play all 3 games

account for **all** students.

This can be seen by the complete covering in the Venn diagram.

<div class="video-container">
  <video autoplay muted playsinline>
      <source src="assets/tasks/task-12/Scene3.webm" type="video/webm">
      Your browser does not support the video tag.
  </video>
  <button class="replay-btn" aria-label="Replay">⟳</button>
</div>

#### Mathematical Deduction

Thus,

$$
\\begin{aligned}
25 + 30 + 35 + x &\\ge 100 \\\\
x &\\ge 100 - 25 - 30 - 25 = 10
\\end{aligned}
$$

The percentage of students who play all 3 games is at least 10%.

#### Reasoning - The Case of Inequality

The strict inequality occurs then there is double counting in the covering, for example, when there is 1 student who does not play badminton, and does not play basketball.

Double counting does not arise when **all** students play at least 2 of these games. And in this case, the percentage of students who play all 3 games is indeed 10%.

This sitation is depicted in the Venn diagram.