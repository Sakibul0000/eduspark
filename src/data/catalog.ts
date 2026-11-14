import type { Course, CourseCategory, Quiz } from '../types/lms';

export const COURSE_CATEGORIES: CourseCategory[] = [
  'Computer Science',
  'Programming',
  'Artificial Intelligence',
  'Data Science',
  'Web Development',
  'Mathematics',
];

export const COURSES_CATALOG: Course[] = [
  {
    id: 'cs-algorithms',
    title: 'Algorithms & Data Structures Mastery',
    category: 'Computer Science',
    instructor: 'Dr. Elena Vance',
    instructorRole: 'Principal Systems Architect',
    description:
      'Build deep intuition for asymptotic analysis, trees, graphs, dynamic programming, and memory-efficient data structures used in production software.',
    thumbnail: '/src/assets/images/course_code_systems_1794636276412.jpg',
    difficulty: 'Intermediate',
    durationMinutes: 510,
    lessonsCount: 6,
    popularity: 98,
    lessons: [
      {
        id: 'cs-alg-1',
        courseId: 'cs-algorithms',
        order: 1,
        title: 'Asymptotic Complexity & Big-O Thinking',
        durationMinutes: 45,
        summary: 'Analyze worst-case time and space scaling before writing a single line of code.',
        content:
          'Algorithmic efficiency determines whether an application remains responsive when data scales from a hundred records to ten million. Big-O notation captures the upper-bound growth rate of operations relative to input size n, stripping away hardware-dependent constants so we can compare designs objectively.\n\nWhen evaluating an algorithm, focus on the dominant term: a loop inside a loop over the same input scales quadratically O(n^2), whereas halving the search space on each iteration yields logarithmic O(log n) performance. Always pair time complexity analysis with auxiliary space complexity so memory bottlenecks never catch you by surprise.',
        keyTakeaways: [
          'Drop lower-order terms and constant multipliers when comparing asymptotic growth.',
          'O(1) and O(log n) scale cleanly to massive datasets; O(n^2) degrades rapidly past n = 10,000.',
          'Amortized analysis explains why dynamic array appends remain O(1) on average.',
        ],
        codeExample: {
          language: 'typescript',
          code: `function binarySearch(sorted: number[], target: number): number {
  let left = 0;
  let right = sorted.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
        },
      },
      {
        id: 'cs-alg-2',
        courseId: 'cs-algorithms',
        order: 2,
        title: 'Hash Tables & Collision Resolution',
        durationMinutes: 50,
        summary: 'Understand hash functions, load factors, chaining, and open addressing.',
        content:
          'Hash tables turn arbitrary keys into array indices in O(1) expected time. A deterministic hash function maps a key to an integer, and modulo arithmetic places it into a bucket. Because distinct keys can collide on the same bucket, production hash maps rely on either separate chaining (linked buckets) or open addressing (probing nearby slots).\n\nMaintaining a healthy load factor—typically below 0.75 before resizing—prevents lookup chains from degrading toward O(n).',
        keyTakeaways: [
          'Choose uniform hash functions to distribute keys evenly across buckets.',
          'Resize and rehash before load factor crosses 0.75 to preserve O(1) lookups.',
          'Frequency counting and two-sum lookups are classic hash map patterns.',
        ],
      },
      {
        id: 'cs-alg-3',
        courseId: 'cs-algorithms',
        order: 3,
        title: 'Stacks, Queues & Monotonic Patterns',
        durationMinutes: 40,
        summary: 'Solve bracket validation, task scheduling, and sliding-window problems cleanly.',
        content:
          'Stacks (Last-In, First-Out) mirror function call frames and undo histories, while Queues (First-In, First-Out) power breadth-first traversal and asynchronous job pipelines. A monotonic stack keeps elements strictly increasing or decreasing, unlocking linear-time O(n) solutions to "next greater element" and histogram area problems.',
        keyTakeaways: [
          'Use a stack when nested context or recent-state reversal is required.',
          'Double-ended queues (deques) enable O(n) sliding-window maximum queries.',
        ],
      },
      {
        id: 'cs-alg-4',
        courseId: 'cs-algorithms',
        order: 4,
        title: 'Binary Trees & Breadth/Depth Traversals',
        durationMinutes: 55,
        summary: 'Master pre-order, in-order, post-order, and level-order tree navigation.',
        content:
          'Trees organize hierarchical relationships naturally—from DOM trees and file systems to database B-trees. Depth-First Search (DFS) explores a branch completely before backtracking, while Breadth-First Search (BFS) sweeps level by level using a queue. In a Binary Search Tree, an in-order traversal visits every node in sorted ascending order.',
        keyTakeaways: [
          'DFS uses recursion or an explicit stack; BFS uses a FIFO queue.',
          'Tree height dictates recursion stack space: O(log n) balanced vs. O(n) skewed.',
        ],
      },
      {
        id: 'cs-alg-5',
        courseId: 'cs-algorithms',
        order: 5,
        title: 'Graph Representations & Shortest Paths',
        durationMinutes: 60,
        summary: 'Model networks with adjacency lists and compute shortest paths with Dijkstra.',
        content:
          'Graphs generalize trees by allowing cycles and arbitrary edges. Sparse real-world graphs—like road maps, dependency graphs, and social networks—belong in adjacency lists rather than dense O(V^2) matrices. For unweighted graphs, BFS finds the shortest path in O(V + E). When edges carry non-negative weights, Dijkstra’s algorithm uses a min-heap priority queue to settle the closest unvisited vertex iteratively.',
        keyTakeaways: [
          'Adjacency lists save memory on sparse graphs: O(V + E).',
          'Topological sort orders Directed Acyclic Graphs (DAGs) for build & task pipelines.',
        ],
      },
      {
        id: 'cs-alg-6',
        courseId: 'cs-algorithms',
        order: 6,
        title: 'Dynamic Programming & Memoization',
        durationMinutes: 65,
        summary: 'Break overlapping subproblems into clean recurrence relations.',
        content:
          'Dynamic programming applies whenever a problem exhibits optimal substructure and overlapping subproblems. Start by defining the state cleanly (what minimal information describes a subproblem?), write the recursive transition, and then eliminate redundant work either top-down with memoization or bottom-up with a table.',
        keyTakeaways: [
          'Define the DP state and base cases explicitly before optimizing memory.',
          'Bottom-up tabulation often compresses space from O(n^2) to O(n).',
        ],
      },
    ],
  },
  {
    id: 'prog-python',
    title: 'Modern Python Programming from Scratch',
    category: 'Programming',
    instructor: 'Marcus Chen',
    instructorRole: 'Senior Backend Engineer',
    description:
      'Write clean, idiomatic Python 3 with strong type hints, data structures, functional iterators, error handling, and modular software architecture.',
    thumbnail: '/src/assets/images/course_code_systems_1794636276412.jpg',
    difficulty: 'Beginner',
    durationMinutes: 405,
    lessonsCount: 6,
    popularity: 96,
    lessons: [
      {
        id: 'py-1',
        courseId: 'prog-python',
        order: 1,
        title: 'Pythonic Variables, Types & Control Flow',
        durationMinutes: 40,
        summary: 'Master dynamic typing, type annotations, f-strings, and clean conditional logic.',
        content:
          'Python prioritizes human readability. Even though Python is dynamically typed at runtime, modern Python 3 uses type annotations (`str`, `int`, `list[float]`) so editors and static analyzers catch mismatches early. Combine f-strings for crisp formatting with guard clauses to keep nested conditionals shallow.',
        keyTakeaways: [
          'Use meaningful snake_case variable names and explicit type hints on function signatures.',
          'Prefer early returns (guard clauses) over deeply nested if/else pyramids.',
        ],
        codeExample: {
          language: 'python',
          code: `def summarize_grade(score: float, passing: float = 60.0) -> str:
    if score < 0 or score > 100:
        raise ValueError("Score must be between 0 and 100")
    status = "Passed" if score >= passing else "Needs Review"
    return f"{status} ({score:.1f}%)"`,
        },
      },
      {
        id: 'py-2',
        courseId: 'prog-python',
        order: 2,
        title: 'Lists, Tuples, Sets & Dictionaries',
        durationMinutes: 45,
        summary: 'Select the right built-in collection for ordering, uniqueness, or fast lookup.',
        content:
          'Python’s four core built-in collections cover 90% of everyday modeling needs. Lists are ordered and mutable; tuples are ordered and immutable (ideal for fixed records); sets guarantee uniqueness with O(1) membership checks; and dictionaries map hashable keys to values while preserving insertion order.',
        keyTakeaways: [
          'Use sets for fast deduplication and membership testing (`item in seen`).',
          'Prefer `.get(key, default)` when reading optional dictionary keys.',
        ],
      },
      {
        id: 'py-3',
        courseId: 'prog-python',
        order: 3,
        title: 'Comprehensions & Generator Expressions',
        durationMinutes: 40,
        summary: 'Transform and filter sequences concisely without wasting memory.',
        content:
          'List and dictionary comprehensions express map-and-filter pipelines in one readable line. When processing large files or streams, swap square brackets for parentheses to build a lazy generator expression that yields one item at a time without allocating the full list in memory.',
        keyTakeaways: [
          'Keep comprehensions readable; extract complex logic into helper functions.',
          'Generators evaluate lazily and keep memory footprint constant.',
        ],
      },
      {
        id: 'py-4',
        courseId: 'prog-python',
        order: 4,
        title: 'Functions, Closures & Decorators',
        durationMinutes: 50,
        summary: 'Treat functions as first-class objects and build reusable wrappers.',
        content:
          'In Python, functions are objects that can be passed as arguments, returned from other functions, and stored in data structures. Decorators leverage closures to wrap cross-cutting behavior—such as timing, caching (`@lru_cache`), or access checks—cleanly around existing functions.',
        keyTakeaways: [
          'Avoid mutable default arguments like `def add(items=[])`; default to `None`.',
          'Use `functools.wraps` inside custom decorators to preserve metadata.',
        ],
      },
      {
        id: 'py-5',
        courseId: 'prog-python',
        order: 5,
        title: 'Dataclasses & Object-Oriented Design',
        durationMinutes: 55,
        summary: 'Model domain entities cleanly with `@dataclass` and composition.',
        content:
          'Python’s `@dataclass` decorator eliminates boilerplate `__init__` and `__repr__` code while keeping classes transparent and type-safe. Favor composition over deep inheritance hierarchies so behaviors stay modular and testable.',
        keyTakeaways: [
          'Use `@dataclass(frozen=True)` for immutable value objects.',
          'Keep class responsibilities focused around cohesive state and behavior.',
        ],
      },
      {
        id: 'py-6',
        courseId: 'prog-python',
        order: 6,
        title: 'Exceptions, Context Managers & Testing',
        durationMinutes: 50,
        summary: 'Handle failure gracefully with `with` blocks and automated `pytest` checks.',
        content:
          'Context managers (`with open(...) as f:`) guarantee resources are released even when exceptions occur. Catch specific exceptions rather than bare `except:` clauses, and verify edge cases automatically using small, deterministic unit tests.',
        keyTakeaways: [
          'Always catch explicit exception types like `ValueError` or `FileNotFoundError`.',
          'Context managers guarantee cleanup of files, locks, and network connections.',
        ],
      },
    ],
  },
  {
    id: 'ai-ml-foundations',
    title: 'Foundations of Machine Learning & Neural Nets',
    category: 'Artificial Intelligence',
    instructor: 'Dr. Priya Nair',
    instructorRole: 'Applied ML Researcher',
    description:
      'Go from linear regression and gradient descent to backpropagation, regularization, and modern neural network architectures.',
    thumbnail: '/src/assets/images/course_ai_neural_1794636276316.jpg',
    difficulty: 'Intermediate',
    durationMinutes: 555,
    lessonsCount: 6,
    popularity: 99,
    lessons: [
      {
        id: 'ml-1',
        courseId: 'ai-ml-foundations',
        order: 1,
        title: 'Supervised Learning & Loss Functions',
        durationMinutes: 50,
        summary: 'Connect training labels, model predictions, and quantitative error metrics.',
        content:
          'Every supervised learning model searches for parameters that map input features X to accurate predictions y_hat. A loss function translates prediction errors into a single scalar score—Mean Squared Error (MSE) for continuous regression targets, and Cross-Entropy Loss for classification probabilities.',
        keyTakeaways: [
          'Always split data into training, validation, and held-out test sets before tuning.',
          'Cross-entropy penalizes confident wrong predictions strongly.',
        ],
      },
      {
        id: 'ml-2',
        courseId: 'ai-ml-foundations',
        order: 2,
        title: 'Gradient Descent & Optimization Dynamics',
        durationMinutes: 55,
        summary: 'Step downhill on the loss surface using derivatives and learning rates.',
        content:
          'Gradient descent iteratively updates each model weight in the opposite direction of the loss gradient. Too small a learning rate crawls slowly; too large a learning rate overshoots the minimum and diverges. Modern optimizers like Adam adapt per-parameter step sizes using momentum and squared gradient history.',
        keyTakeaways: [
          'Mini-batch gradient descent balances hardware parallelism with noisy regularization.',
          'Feature scaling ensures steep and flat axes converge smoothly together.',
        ],
        codeExample: {
          language: 'python',
          code: `def gradient_descent_step(w: float, b: float, x: float, y: float, lr: float = 0.01):
    pred = w * x + b
    error = pred - y
    dw = 2 * error * x
    db = 2 * error
    return w - lr * dw, b - lr * db`,
        },
      },
      {
        id: 'ml-3',
        courseId: 'ai-ml-foundations',
        order: 3,
        title: 'Bias-Variance Tradeoff & Regularization',
        durationMinutes: 45,
        summary: 'Diagnose underfitting vs. overfitting and stabilize generalization.',
        content:
          'A model with high bias is too rigid to capture true patterns (underfitting), while a model with high variance memorizes training noise and fails on unseen data (overfitting). Techniques such as L2 weight decay, dropout, and early stopping constrain complexity so models generalize cleanly.',
        keyTakeaways: [
          'Compare training loss vs. validation loss to spot overfitting early.',
          'More diverse training data directly reduces variance.',
        ],
      },
      {
        id: 'ml-4',
        courseId: 'ai-ml-foundations',
        order: 4,
        title: 'Perceptrons, Activations & Multi-Layer Nets',
        durationMinutes: 60,
        summary: 'Understand why non-linear activations unlock deep function approximation.',
        content:
          'Stacking purely linear layers collapses into a single linear transformation. Introducing non-linear activation functions—such as ReLU, GELU, or SiLU—between dense layers allows neural networks to carve curved decision boundaries and compose hierarchical representations.',
        keyTakeaways: [
          'Without non-linear activations, a 10-layer network has no more capacity than 1 layer.',
          'ReLU avoids saturation on positive values, speeding up gradient flow.',
        ],
      },
      {
        id: 'ml-5',
        courseId: 'ai-ml-foundations',
        order: 5,
        title: 'Backpropagation & Chain Rule Intuition',
        durationMinutes: 60,
        summary: 'Trace how error signals flow backward through computation graphs.',
        content:
          'Backpropagation is simply the multivariable chain rule applied systematically across a computation graph. During the forward pass, intermediate activations are cached; during the backward pass, each layer multiplies the incoming upstream gradient by its local derivative to compute exact parameter updates.',
        keyTakeaways: [
          'Residual skip connections prevent gradients from vanishing in deep networks.',
          'Automatic differentiation frameworks track computation graphs dynamically.',
        ],
      },
      {
        id: 'ml-6',
        courseId: 'ai-ml-foundations',
        order: 6,
        title: 'Evaluating Classifiers Beyond Accuracy',
        durationMinutes: 45,
        summary: 'Use precision, recall, F1, and ROC-AUC on imbalanced datasets.',
        content:
          'If 99% of transactions are legitimate, a trivial model that predicts "legitimate" every time achieves 99% accuracy while catching zero fraud. Precision measures how many positive predictions were right; recall measures how many actual positives were caught. F1 combines both into one balanced metric.',
        keyTakeaways: [
          'Never rely solely on raw accuracy when classes are imbalanced.',
          'Tune decision thresholds based on false-positive vs. false-negative cost.',
        ],
      },
    ],
  },
  {
    id: 'ds-inference',
    title: 'Applied Data Science & Statistical Inference',
    category: 'Data Science',
    instructor: 'Prof. Henrik Lindqvist',
    instructorRole: 'Lead Quantitative Analyst',
    description:
      'Turn messy real-world datasets into trustworthy decisions using exploratory analysis, probability distributions, hypothesis testing, and clean visualizations.',
    thumbnail: '/src/assets/images/course_math_geometry_1794636277361.jpg',
    difficulty: 'Intermediate',
    durationMinutes: 440,
    lessonsCount: 5,
    popularity: 89,
    lessons: [
      {
        id: 'ds-1',
        courseId: 'ds-inference',
        order: 1,
        title: 'Exploratory Data Analysis & Missing Data',
        durationMinutes: 50,
        summary: 'Audit distributions, outliers, and data leakage before modeling.',
        content:
          'Before fitting any statistical model, inspect column types, missingness patterns, and extreme values. Missing data is rarely random—understanding why a sensor dropped readings or why users skipped a survey field prevents biased conclusions.',
        keyTakeaways: [
          'Always compute medians and IQRs alongside means and standard deviations.',
          'Never impute missing values using statistics computed across the test set.',
        ],
      },
      {
        id: 'ds-2',
        courseId: 'ds-inference',
        order: 2,
        title: 'Sampling Distributions & Confidence Intervals',
        durationMinutes: 55,
        summary: 'Quantify uncertainty honestly using the Central Limit Theorem.',
        content:
          'A single sample mean fluctuates from sample to sample. The Central Limit Theorem shows that sample means cluster in an approximately normal distribution whose spread shrinks with the square root of sample size n. Confidence intervals communicate the plausible range of the true population parameter.',
        keyTakeaways: [
          'Cutting standard error in half requires 4x as many independent observations.',
          'Point estimates without uncertainty intervals invite overconfidence.',
        ],
      },
      {
        id: 'ds-3',
        courseId: 'ds-inference',
        order: 3,
        title: 'Hypothesis Testing & A/B Experimentation',
        durationMinutes: 55,
        summary: 'Design controlled experiments, avoid p-hacking, and measure effect size.',
        content:
          'A statistically significant p-value tells you an observed difference is unlikely under the null hypothesis—not that the difference is practically large. Always pre-register sample size via power analysis and inspect practical effect sizes before shipping product changes.',
        keyTakeaways: [
          'Statistical significance does not automatically imply business importance.',
          'Avoid peeking at A/B test results daily and stopping early.',
        ],
      },
      {
        id: 'ds-4',
        courseId: 'ds-inference',
        order: 4,
        title: 'Correlation, Confounders & Causal Thinking',
        durationMinutes: 50,
        summary: 'Separate genuine causal drivers from spurious correlations.',
        content:
          'Two variables can move together purely because a hidden third variable (a confounder) drives both. Drawing causal diagrams helps identify which variables to control for—and which variables (like colliders) will introduce bias if conditioned on.',
        keyTakeaways: [
          'Simpson’s paradox occurs when aggregated trends reverse inside subgroups.',
          'Randomization remains the gold standard for isolating causal effects.',
        ],
      },
      {
        id: 'ds-5',
        courseId: 'ds-inference',
        order: 5,
        title: 'Communicating Insights with Honest Charts',
        durationMinutes: 45,
        summary: 'Choose high-signal chart encodings and eliminate visual distortion.',
        content:
          'Bar charts encode magnitudes by length and must anchor at zero. Line charts excel at continuous time series, while scatter plots reveal bivariate clusters and variance. Label units, timeframes, and sample sizes directly so readers never guess what an axis represents.',
        keyTakeaways: [
          'Start bar chart baselines at zero to avoid exaggerating small deltas.',
          'Annotate key inflection points directly on the chart canvas.',
        ],
      },
    ],
  },
  {
    id: 'web-ts-react',
    title: 'Full-Stack TypeScript & React Architecture',
    category: 'Web Development',
    instructor: 'Sofia Alvarez',
    instructorRole: 'Staff Frontend Engineer',
    description:
      'Design resilient web applications with strict TypeScript types, predictable React state flows, accessible interfaces, and secure REST API integration.',
    thumbnail: '/src/assets/images/course_web_architecture_1794636276975.jpg',
    difficulty: 'Intermediate',
    durationMinutes: 480,
    lessonsCount: 6,
    popularity: 95,
    lessons: [
      {
        id: 'web-1',
        courseId: 'web-ts-react',
        order: 1,
        title: 'Strict TypeScript & Discriminated Unions',
        durationMinutes: 45,
        summary: 'Make invalid UI states unrepresentable at compile time.',
        content:
          'Instead of tracking separate boolean flags like `isLoading`, `hasError`, and `data` that can conflict, model async state as a discriminated union (`status: "loading" | "error" | "success"`). TypeScript narrows the payload automatically inside switch or if blocks.',
        keyTakeaways: [
          'Discriminated unions eliminate impossible combinations of loading and error states.',
          'Avoid `any`; validate external API payloads at runtime boundaries.',
        ],
        codeExample: {
          language: 'typescript',
          code: `type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };`,
        },
      },
      {
        id: 'web-2',
        courseId: 'web-ts-react',
        order: 2,
        title: 'Component Composition & State Placement',
        durationMinutes: 50,
        summary: 'Keep state close to where it is used and derive computed values cleanly.',
        content:
          'Every redundant piece of state is an opportunity for synchronization bugs. If a value—such as filtered courses or total progress percentage—can be computed directly from existing state during render, derive it rather than duplicating it with `useEffect`.',
        keyTakeaways: [
          'Derive filtered lists and totals inline or via `useMemo` instead of syncing state.',
          'Lift state only to the nearest common ancestor that needs it.',
        ],
      },
      {
        id: 'web-3',
        courseId: 'web-ts-react',
        order: 3,
        title: 'Responsive Grid Systems & Accessible UI',
        durationMinutes: 45,
        summary: 'Build layouts that adapt seamlessly from 375px phones to 1440px monitors.',
        content:
          'True responsiveness goes beyond shrinking columns—it preserves readable line lengths, generous touch targets (>= 44px on mobile), keyboard focus rings, and zero horizontal overflow. Always pair color indicators with explicit text or icons.',
        keyTakeaways: [
          'Use semantic HTML (`button`, `nav`, `main`, `label`) for free keyboard and screen-reader support.',
          'Verify mobile drawers, charts, and tables at 375px viewport width.',
        ],
      },
      {
        id: 'web-4',
        courseId: 'web-ts-react',
        order: 4,
        title: 'Server API Boundaries & Optimistic UX',
        durationMinutes: 50,
        summary: 'Separate client UI from server secrets and handle network failures gracefully.',
        content:
          'Sensitive credentials—like LLM API keys or database admin tokens—belong strictly on the server behind validated `/api/*` endpoints. On the client, provide immediate loading states, clear error banners, and rollback paths when mutations fail.',
        keyTakeaways: [
          'Never bundle private API keys into client-side JavaScript.',
          'Validate request bodies and size limits on every API route.',
        ],
      },
      {
        id: 'web-5',
        courseId: 'web-ts-react',
        order: 5,
        title: 'Real-Time Cloud Persistence Patterns',
        durationMinutes: 55,
        summary: 'Synchronize user state securely with Cloud Firestore listeners and rules.',
        content:
          'Real-time listeners keep UI state synchronized across browser tabs without manual polling. Pair client queries with strict server-side security rules that enforce ownership, schema shape, and timestamp integrity on every read and write.',
        keyTakeaways: [
          'Always attach error callbacks to `onSnapshot` listeners and unsubscribe on unmount.',
          'Enforce data invariants in security rules—never trust client-only checks.',
        ],
      },
      {
        id: 'web-6',
        courseId: 'web-ts-react',
        order: 6,
        title: 'Performance Profiling & Bundle Hygiene',
        durationMinutes: 45,
        summary: 'Prevent unnecessary re-renders and keep initial loads snappy.',
        content:
          'Measure before optimizing: inspect React DevTools Flamegraphs to locate expensive renders, stabilize callbacks passed to deep subtrees, and avoid heavy synchronous work on the main thread.',
        keyTakeaways: [
          'Use stable unique `key` props on lists—never array indices for reorderable items.',
          'Keep animation transforms on compositor properties (`transform`, `opacity`).',
        ],
      },
    ],
  },
  {
    id: 'math-linear-alg',
    title: 'Linear Algebra for Computing & AI',
    category: 'Mathematics',
    instructor: 'Dr. Arthur Pendelton',
    instructorRole: 'Professor of Applied Mathematics',
    description:
      'Visualize vectors, matrix transformations, eigenvalues, orthogonality, and SVD—the mathematical engine behind graphics, physics, and neural networks.',
    thumbnail: '/src/assets/images/course_math_geometry_1794636277361.jpg',
    difficulty: 'Beginner',
    durationMinutes: 370,
    lessonsCount: 5,
    popularity: 88,
    lessons: [
      {
        id: 'math-1',
        courseId: 'math-linear-alg',
        order: 1,
        title: 'Vectors, Linear Combinations & Span',
        durationMinutes: 45,
        summary: 'See vectors both as data arrays and as geometric arrows in space.',
        content:
          'In computing, a vector might represent RGB pixels, word embeddings, or user preferences. Geometrically, adding vectors tips-to-tail and scaling them traces out their span—all destinations reachable through linear combinations.',
        keyTakeaways: [
          'Linearly independent basis vectors span space without redundancy.',
          'The dot product measures alignment between two vectors.',
        ],
      },
      {
        id: 'math-2',
        courseId: 'math-linear-alg',
        order: 2,
        title: 'Matrices as Linear Transformations',
        durationMinutes: 50,
        summary: 'Interpret matrix multiplication as rotating, scaling, and shearing space.',
        content:
          'Every matrix encodes a linear transformation of space where grid lines remain parallel and evenly spaced, and the origin stays fixed. The columns of a matrix tell you exactly where the standard basis vectors land after the transformation.',
        keyTakeaways: [
          'Matrix multiplication composes transformations from right to left.',
          'Determinants measure how much a transformation scales area or volume.',
        ],
      },
      {
        id: 'math-3',
        courseId: 'math-linear-alg',
        order: 3,
        title: 'Orthogonality, Projections & Cosine Similarity',
        durationMinutes: 45,
        summary: 'Measure semantic similarity in vector databases and search.',
        content:
          'Two vectors are orthogonal when their dot product equals zero. Normalizing dot products by vector magnitudes yields cosine similarity—the standard metric for comparing document embeddings regardless of text length.',
        keyTakeaways: [
          'Orthogonal projections find the closest point in a subspace (least squares).',
          'Cosine similarity ranges from -1 (opposite) to +1 (identical direction).',
        ],
      },
      {
        id: 'math-4',
        courseId: 'math-linear-alg',
        order: 4,
        title: 'Eigenvalues & Eigenvectors',
        durationMinutes: 50,
        summary: 'Discover invariant directions that remain unchanged under transformation.',
        content:
          'Most vectors get knocked off their span when multiplied by a matrix, but eigenvectors stay on their original line—only stretched or flipped by their eigenvalue scalar. This underpins Principal Component Analysis (PCA), vibration analysis, and PageRank.',
        keyTakeaways: [
          'Av = lambda * v defines an eigenvector v and its eigenvalue lambda.',
          'Repeated matrix powers amplify the dominant eigenvector.',
        ],
      },
      {
        id: 'math-5',
        courseId: 'math-linear-alg',
        order: 5,
        title: 'Singular Value Decomposition (SVD)',
        durationMinutes: 55,
        summary: 'Compress matrices and power low-rank recommender systems.',
        content:
          'Unlike eigendecomposition, SVD works on any rectangular matrix. It factors data into rotation, axis-aligned scaling, and another rotation—allowing you to drop tiny singular values for lossy compression, noise reduction, and collaborative filtering.',
        keyTakeaways: [
          'Every real matrix admits an SVD factorization A = U Sigma V^T.',
          'Low-rank approximations capture maximum variance with minimal storage.',
        ],
      },
    ],
  },
  {
    id: 'ai-llm-systems',
    title: 'Prompt Engineering & Applied LLM Systems',
    category: 'Artificial Intelligence',
    instructor: 'Maya Lin',
    instructorRole: 'AI Systems Lead',
    description:
      'Architect reliable AI workflows with structured JSON outputs, retrieval grounding, evaluation harnesses, and safe server-side orchestration.',
    thumbnail: '/src/assets/images/course_ai_neural_1794636276316.jpg',
    difficulty: 'Advanced',
    durationMinutes: 340,
    lessonsCount: 5,
    popularity: 94,
    lessons: [
      {
        id: 'llm-1',
        courseId: 'ai-llm-systems',
        order: 1,
        title: 'System Instructions & Structured Output Schemas',
        durationMinutes: 45,
        summary: 'Constrain model responses into deterministic JSON contracts.',
        content:
          'Production AI features should never parse fragile free-form prose with regex. Pairing clear system instructions with explicit response schemas enforces valid field types, enums, and predictable downstream rendering.',
        keyTakeaways: [
          'Separate untrusted user input from trusted system instructions.',
          'Use schema constraints whenever your UI renders structured cards or tables.',
        ],
      },
      {
        id: 'llm-2',
        courseId: 'ai-llm-systems',
        order: 2,
        title: 'Context Management & Retrieval Grounding',
        durationMinutes: 50,
        summary: 'Reduce hallucinations by supplying verified reference passages.',
        content:
          'Retrieval-Augmented Generation (RAG) grounds model answers in current, domain-specific documents retrieved at query time. Chunk documents along natural section boundaries and instruct the model to cite or admit when evidence is absent.',
        keyTakeaways: [
          'Good chunking preserves headings and surrounding context.',
          'Require explicit grounding rather than guessing missing facts.',
        ],
      },
      {
        id: 'llm-3',
        courseId: 'ai-llm-systems',
        order: 3,
        title: 'Multi-Turn Memory & Streaming UX',
        durationMinutes: 45,
        summary: 'Keep conversation windows bounded and responsive.',
        content:
          'Trim or summarize older turns once conversations grow long so latency stays low and token budgets remain predictable. Always persist conversation records server-side or in user-scoped database collections.',
        keyTakeaways: [
          'Cap sliding history windows to maintain fast turn-around times.',
          'Provide clear fallback states when upstream APIs are unavailable.',
        ],
      },
      {
        id: 'llm-4',
        courseId: 'ai-llm-systems',
        order: 4,
        title: 'Tool Calling & Safe Server Orchestration',
        durationMinutes: 50,
        summary: 'Let models invoke typed backend functions under strict validation.',
        content:
          'Function calling bridges natural language intent and deterministic code execution. Always validate model-generated arguments against strict allowlists and permission checks before mutating any database state.',
        keyTakeaways: [
          'Never execute unvalidated SQL or shell commands from model output.',
          'Treat tool arguments as untrusted user input.',
        ],
      },
      {
        id: 'llm-5',
        courseId: 'ai-llm-systems',
        order: 5,
        title: 'Evaluation Harnesses & Regression Testing',
        durationMinutes: 45,
        summary: 'Measure prompt quality objectively across golden test cases.',
        content:
          'Prompt edits without evaluation often fix one edge case while breaking three others. Maintain a curated test set covering normal requests, ambiguous inputs, and adversarial edge cases before deploying changes.',
        keyTakeaways: [
          'Track pass rates, latency, and schema adherence across prompt versions.',
          'Test graceful error recovery alongside happy paths.',
        ],
      },
    ],
  },
  {
    id: 'cs-operating-sys',
    title: 'Operating Systems & Concurrency Principles',
    category: 'Computer Science',
    instructor: 'Dr. Samuel Okafor',
    instructorRole: 'Distributed Systems Fellow',
    description:
      'Explore processes, threads, CPU scheduling, virtual memory, synchronization primitives, and deadlock prevention in modern kernels.',
    thumbnail: '/src/assets/images/course_code_systems_1794636276412.jpg',
    difficulty: 'Advanced',
    durationMinutes: 470,
    lessonsCount: 5,
    popularity: 86,
    lessons: [
      {
        id: 'os-1',
        courseId: 'cs-operating-sys',
        order: 1,
        title: 'Processes, Threads & Context Switching',
        durationMinutes: 55,
        summary: 'Compare isolated process address spaces with shared-memory threads.',
        content:
          'A process provides an isolated virtual address space and file table, protecting programs from corrupting one another. Threads inside the same process share heap memory for fast communication, at the cost of requiring careful synchronization.',
        keyTakeaways: [
          'Context switching saves CPU registers and swaps page tables between processes.',
          'Thread creation is significantly lighter than spawning a full OS process.',
        ],
      },
      {
        id: 'os-2',
        courseId: 'cs-operating-sys',
        order: 2,
        title: 'CPU Scheduling & Responsiveness',
        durationMinutes: 50,
        summary: 'Balance throughput, fairness, and interactive tail latency.',
        content:
          'Schedulers decide which runnable thread gets CPU cores next. Round-robin prevents starvation with fixed time slices, while multi-level feedback queues reward interactive I/O-bound tasks with higher priority over long CPU-bound batches.',
        keyTakeaways: [
          'Short time quanta improve interactive responsiveness but increase switching overhead.',
          'Priority inversion occurs when a high-priority task waits on a low-priority lock holder.',
        ],
      },
      {
        id: 'os-3',
        courseId: 'cs-operating-sys',
        order: 3,
        title: 'Mutexes, Semaphores & Race Conditions',
        durationMinutes: 60,
        summary: 'Eliminate data races on shared state using atomic locks.',
        content:
          'When two threads read-modify-write the same counter concurrently without coordination, updates silently disappear. Mutex locks guarantee mutual exclusion around critical sections, while condition variables let threads sleep efficiently until state changes.',
        keyTakeaways: [
          'Keep critical sections short and never hold locks across slow network I/O.',
          'Condition variables prevent wasteful busy-wait spin loops.',
        ],
      },
      {
        id: 'os-4',
        courseId: 'cs-operating-sys',
        order: 4,
        title: 'Deadlock Conditions & Prevention',
        durationMinutes: 50,
        summary: 'Break circular wait using consistent global lock ordering.',
        content:
          'Deadlock arises when four Coffman conditions hold simultaneously: mutual exclusion, hold-and-wait, no preemption, and circular wait. Enforcing a strict total ordering when acquiring multiple locks eliminates circular wait cleanly.',
        keyTakeaways: [
          'Always acquire multiple locks in the same canonical order across every code path.',
          'Timeouts and lock-free atomics provide resilient fallback strategies.',
        ],
      },
      {
        id: 'os-5',
        courseId: 'cs-operating-sys',
        order: 5,
        title: 'Virtual Memory, Paging & Page Faults',
        durationMinutes: 55,
        summary: 'Understand how the MMU maps virtual addresses to physical RAM frames.',
        content:
          'Virtual memory gives every process the illusion of a clean contiguous address space while allowing the kernel to share read-only libraries and swap inactive pages to disk. The Translation Lookaside Buffer (TLB) caches recent address translations in hardware.',
        keyTakeaways: [
          'Spatial and temporal locality maximize CPU cache and TLB hit rates.',
          'Thrashing occurs when working sets exceed physical RAM capacity.',
        ],
      },
    ],
  },
];

export const QUIZZES_CATALOG: Quiz[] = [
  {
    id: 'quiz-python',
    title: 'Python & Programming Fundamentals',
    category: 'Programming',
    courseId: 'prog-python',
    description: 'Assess your grasp of Python collections, functions, mutability, and clean control flow.',
    timeLimitSeconds: 300,
    difficulty: 'Beginner',
    questions: [
      {
        id: 'q-py-1',
        quizId: 'quiz-python',
        order: 1,
        prompt: 'Which built-in Python collection guarantees unique elements and provides O(1) average membership checks?',
        options: ['list', 'tuple', 'set', 'deque'],
        correctIndex: 2,
        explanation: 'A Python set is backed by a hash table, enforcing uniqueness and O(1) average-case `in` lookups.',
      },
      {
        id: 'q-py-2',
        quizId: 'quiz-python',
        order: 2,
        prompt: 'Why should you avoid using a mutable list as a default parameter value like `def append_item(val, items=[])`?',
        options: [
          'Lists cannot be passed to functions in Python 3',
          'The same default list object is shared across every call that omits the argument',
          'Python converts default lists into immutable tuples automatically',
          'It triggers a SyntaxError at module import time',
        ],
        correctIndex: 1,
        explanation: 'Default argument objects are evaluated once at function definition time, so mutating `items` persists across subsequent calls.',
      },
      {
        id: 'q-py-3',
        quizId: 'quiz-python',
        order: 3,
        prompt: 'What is the main advantage of a generator expression `(x * 2 for x in range(1_000_000))` over a list comprehension?',
        options: [
          'It sorts items automatically in descending order',
          'It yields values lazily one at a time without allocating the full list in memory',
          'It executes across multiple CPU cores automatically',
          'It allows random indexing with `gen[500]`',
        ],
        correctIndex: 1,
        explanation: 'Generator expressions compute each item on demand, keeping memory usage constant regardless of sequence length.',
      },
      {
        id: 'q-py-4',
        quizId: 'quiz-python',
        order: 4,
        prompt: 'What does using a `with open("data.txt") as f:` context manager guarantee?',
        options: [
          'The file is encrypted automatically on disk',
          'The file handle is closed cleanly even if an exception occurs inside the block',
          'The file is loaded entirely into GPU memory',
          'Write operations become atomic across all network drives',
        ],
        correctIndex: 1,
        explanation: 'Context managers run `__exit__` when leaving the block, ensuring file handles and resources are always released.',
      },
      {
        id: 'q-py-5',
        quizId: 'quiz-python',
        order: 5,
        prompt: 'Which method safely reads key `"theme"` from a dict `prefs` with fallback `"light"` without raising `KeyError`?',
        options: [
          'prefs.find("theme", "light")',
          'prefs.get("theme", "light")',
          'prefs.pop("theme")',
          'prefs["theme" || "light"]',
        ],
        correctIndex: 1,
        explanation: '`dict.get(key, default)` returns the stored value if present, or the supplied default if the key is missing.',
      },
    ],
  },
  {
    id: 'quiz-dsa',
    title: 'Data Structures & Algorithms Check',
    category: 'Computer Science',
    courseId: 'cs-algorithms',
    description: 'Test your knowledge of Big-O complexity, graph traversals, hash maps, and tree properties.',
    timeLimitSeconds: 360,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q-dsa-1',
        quizId: 'quiz-dsa',
        order: 1,
        prompt: 'What is the worst-case time complexity of Binary Search on a sorted array of n elements?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctIndex: 1,
        explanation: 'Binary search halves the remaining search interval on every comparison, taking at most log2(n) + 1 steps.',
      },
      {
        id: 'q-dsa-2',
        quizId: 'quiz-dsa',
        order: 2,
        prompt: 'Which traversal of a valid Binary Search Tree visits node values in sorted ascending order?',
        options: ['Pre-order', 'In-order', 'Post-order', 'Level-order (BFS)'],
        correctIndex: 1,
        explanation: 'In-order traversal visits left subtree, current node, then right subtree—producing ascending sorted output on a BST.',
      },
      {
        id: 'q-dsa-3',
        quizId: 'quiz-dsa',
        order: 3,
        prompt: 'Which data structure is used internally by Breadth-First Search (BFS) to explore vertices level by level?',
        options: ['Stack (LIFO)', 'FIFO Queue', 'Max-Heap', 'Disjoint Set'],
        correctIndex: 1,
        explanation: 'A First-In, First-Out queue ensures all vertices at distance d are processed before vertices at distance d + 1.',
      },
      {
        id: 'q-dsa-4',
        quizId: 'quiz-dsa',
        order: 4,
        prompt: 'Why is an adjacency list usually preferred over an adjacency matrix for large sparse graphs?',
        options: [
          'Adjacency lists require O(V + E) space instead of O(V^2)',
          'Adjacency lists automatically sort edge weights',
          'Adjacency matrices cannot represent directed graphs',
          'Adjacency lists allow O(1) matrix multiplication',
        ],
        correctIndex: 0,
        explanation: 'When edges E << V^2, storing only existing neighbors takes O(V + E) memory rather than allocating V^2 entries.',
      },
      {
        id: 'q-dsa-5',
        quizId: 'quiz-dsa',
        order: 5,
        prompt: 'What two problem properties indicate that Dynamic Programming is an appropriate technique?',
        options: [
          'Random inputs and unsorted keys',
          'Overlapping subproblems and optimal substructure',
          'Cyclic dependencies and unbounded recursion',
          'Constant space and non-deterministic branching',
        ],
        correctIndex: 1,
        explanation: 'DP eliminates redundant work when subproblems repeat (overlapping subproblems) and global solutions build from optimal sub-solutions.',
      },
    ],
  },
  {
    id: 'quiz-ai-ml',
    title: 'Machine Learning & AI Concepts',
    category: 'Artificial Intelligence',
    courseId: 'ai-ml-foundations',
    description: 'Validate your understanding of gradient descent, overfitting, activation functions, and model evaluation.',
    timeLimitSeconds: 360,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q-ml-1',
        quizId: 'quiz-ai-ml',
        order: 1,
        prompt: 'Why do neural networks require non-linear activation functions like ReLU or GELU between linear layers?',
        options: [
          'To convert floating-point numbers into integers',
          'Without non-linearities, stacked linear layers collapse into a single linear transformation',
          'To prevent GPUs from using parallel threads',
          'To remove the need for a loss function during training',
        ],
        correctIndex: 1,
        explanation: 'A composition of linear transformations is still linear; non-linear activations let networks approximate curved decision boundaries.',
      },
      {
        id: 'q-ml-2',
        quizId: 'quiz-ai-ml',
        order: 2,
        prompt: 'Your model reaches 99% accuracy on the training set but only 62% on the validation set. What is happening?',
        options: [
          'Underfitting (high bias)',
          'Overfitting (high variance)',
          'Learning rate is zero',
          'Perfect generalization',
        ],
        correctIndex: 1,
        explanation: 'A wide gap between low training error and high validation error is the classic signature of overfitting.',
      },
      {
        id: 'q-ml-3',
        quizId: 'quiz-ai-ml',
        order: 3,
        prompt: 'On a fraud dataset where only 0.5% of transactions are fraudulent, why is raw accuracy misleading?',
        options: [
          'Accuracy can only be computed for regression tasks',
          'Predicting "non-fraud" every time gives 99.5% accuracy while catching 0% of fraud',
          'Accuracy ignores the validation split',
          'Accuracy requires normal distribution of features',
        ],
        correctIndex: 1,
        explanation: 'Class imbalance masks failure on the rare positive class; precision, recall, and F1 reveal true detection quality.',
      },
      {
        id: 'q-ml-4',
        quizId: 'quiz-ai-ml',
        order: 4,
        prompt: 'During Gradient Descent, what typically happens if the learning rate is set far too high?',
        options: [
          'Training converges immediately in one epoch with zero error',
          'Updates overshoot the minimum and the loss oscillates or diverges',
          'The model automatically switches to unsupervised clustering',
          'Validation accuracy increases monotonically',
        ],
        correctIndex: 1,
        explanation: 'Oversized gradient steps leap past the valley of the loss surface, causing instability or divergence.',
      },
      {
        id: 'q-ml-5',
        quizId: 'quiz-ai-ml',
        order: 5,
        prompt: 'In an LLM application, why should structured JSON output schemas be preferred over regex parsing?',
        options: [
          'JSON schemas double the model’s training dataset',
          'Schemas enforce predictable field names and types at generation time',
          'Regex cannot match numbers in JavaScript',
          'JSON bypasses server-side API authentication',
        ],
        correctIndex: 1,
        explanation: 'Schema-constrained generation guarantees valid structure and field types before the frontend consumes the response.',
      },
    ],
  },
  {
    id: 'quiz-web-ts',
    title: 'Web Development & TypeScript Quiz',
    category: 'Web Development',
    courseId: 'web-ts-react',
    description: 'Check your mastery of TypeScript unions, React state architecture, and full-stack security boundaries.',
    timeLimitSeconds: 300,
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'q-web-1',
        quizId: 'quiz-web-ts',
        order: 1,
        prompt: 'Why are discriminated unions preferred over separate `isLoading`, `isError`, and `data` booleans in TypeScript?',
        options: [
          'They reduce CSS bundle size by 50%',
          'They make contradictory states like loading + error impossible at compile time',
          'They allow React components to skip `return` statements',
          'They store state directly in DNS records',
        ],
        correctIndex: 1,
        explanation: 'A discriminated union ties each `status` literal to only its valid payload fields, eliminating conflicting boolean flags.',
      },
      {
        id: 'q-web-2',
        quizId: 'quiz-web-ts',
        order: 2,
        prompt: 'Where should private API keys such as `GEMINI_API_KEY` be accessed in a production web application?',
        options: [
          'In React component props',
          'In localStorage so users can inspect them',
          'Strictly on the backend server behind validated `/api/*` routes',
          'Inside `index.html` meta tags',
        ],
        correctIndex: 2,
        explanation: 'Browser code is publicly inspectable; keeping secrets on the server protects credentials and enforces request validation.',
      },
      {
        id: 'q-web-3',
        quizId: 'quiz-web-ts',
        order: 3,
        prompt: 'When should a derived value like `filteredCourses` be computed in React?',
        options: [
          'Stored in a separate `useState` and synchronized via `useEffect`',
          'Derived directly during render (or memoized with `useMemo`) from source state',
          'Saved to Firestore on every keystroke',
          'Passed through `window.localStorage` before rendering',
        ],
        correctIndex: 1,
        explanation: 'Computing derived values directly from source state avoids stale synchronization bugs and extra render cycles.',
      },
      {
        id: 'q-web-4',
        quizId: 'quiz-web-ts',
        order: 4,
        prompt: 'Why should Firestore security rules enforce ownership and field validation rather than relying on client queries?',
        options: [
          'Client queries run only in Safari',
          'Attackers can invoke Firestore APIs directly, bypassing client UI code',
          'Security rules compress images automatically',
          'Firestore refuses to index documents without rules',
        ],
        correctIndex: 1,
        explanation: 'Security rules execute on Google servers for every request, guaranteeing invariants even if someone bypasses your frontend.',
      },
      {
        id: 'q-web-5',
        quizId: 'quiz-web-ts',
        order: 5,
        prompt: 'Which CSS properties are safest to animate smoothly without triggering expensive browser layout recalculations?',
        options: [
          'width and height',
          'top, left, and margin',
          'transform and opacity',
          'border-width and font-size',
        ],
        correctIndex: 2,
        explanation: '`transform` and `opacity` run on the GPU compositor thread without forcing layout or repaint passes.',
      },
    ],
  },
];
