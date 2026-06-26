# Pull Request Workflow Guide
Standards and requirements for opening pull requests. Please refer to this document as you work on tickets.

## 1. Before Opening a PR
1. Sync your local branch with main and resolve all merge conflicts.

2. Ensure your PR addresses only one concern.
    * Keep PRs small!
    * If the PR is too large, consider breaking it into multiple PRs that each address one concern.

3. [Refactor](https://refactoring.guru/refactoring/techniques).
    * Complicated logic and JSX should be extracted into functions.
    * Use clear and consistent naming conventions.
    * It should be clear what your code does simply by looking at it.

4. Manually test (i.e., use the website) any part of the application you modify. If applicable, write unit tests and integration tests. Any complex logic should be unit tested. AI is a good tool for generating unit tests; just be sure that the tests are well designed. See the guide on unit testing with Vitest.

## 2. Opening a PR
**Note:** If your work is in-progress but you want early visibility or reviews, open the PR as a draft.

### Branch Naming Conventions
Branch names should contain the relevant Linear ticket, then a forward slash, then a short description in kebab case. Linear will detect the issue key in the branch name and link it automatically.
Example: `EHR-123/short-description`

If the PR is not related to a Linear ticket, your branch should only contain the short description in kebab case.
Example: `short-description`

### PR Naming Conventions
PR names should also contain the relevant Linear ticket. Again, Linear will automatically link it.
Example: `EHR-123: Short description of change`

Like before, if the PR is not related to a Linear ticket, you only need the description.
Example: `Short description of change`

### PR Descriptions
Be descriptive and provide as much context as possible in your PR descriptions. Explain why the change is important.

Use this template as a starting point:

```markdown
## Summary
Overview of the change.
Be descriptive.

Issue:
[EHR-123](https://linear.app/gvsu-blue-nucleus/issue/EHR-123)

Related Issues:
* [EHR-99](https://linear.app/gvsu-blue-nucleus/issue/EHR-99)
* [EHR-121](https://linear.app/gvsu-blue-nucleus/issue/EHR-121)

## Testing
Recap of any testing you've done. If you used a unique testing strategy, describe it here.
Provide any relevant artifacts or data to prove your testing.

## Screenshots
<img>

## Review Focus
Let the reviewer(s) know what parts of the code most need review.
This is a good place to ask questions and address uncertainty.
```

**Linear**
Put a link to the PR in the relevant issue, and move the issue to the "In-Review" column.

## 3. Requesting Code Reviews
Assign Max as a reviewer, and assign at least one other reviewer. **Reviews are now required on all PRs before they can be merged!**

For PRs with wider scopes (like large refactors or heavy modifications to the database schema), assign multiple reviewers.

After you request a review on GitHub, ping the assigned reviewer(s) in the EHR Discord channel (mention them with "@username"). This keeps everyone up to date with the PR's progress and makes sure reviewers are aware they've been assigned.

## 4. Being a Good Reviewer
### Review Process
Review code critically, constructively, and diligently. Try to review in a timely manner. When reviewing another person's code, ask yourself the following questions:

1. Does the code do what it's supposed to do?
2. Does the code do more than what it's supposed to do?
3. Does the code handle edge cases?
4. Are there tests, and are they meaningful? Do the tests cover the change?
5. Is the code readable and easy to understand? Will a teammate understand the code in six months? Is any of the code duplicated or overly complex?
6. Does the code create any security or performance issues (e.g., SQL injection, exposed secrets)?

**Be sure to checkout the branch and ensure that all tests pass!**
### Requesting Changes
If there are issues (big or small), request changes. Don't be afraid to be a little picky; it's always easier to modify code sooner rather than later. Put each request in a separate comment at the relevant point in the code. Explain your reasoning thoroughly.

### Approval
Once you're content with the state of the PR, approve it. **Only approve when you're genuinely comfortable merging, not just to be polite.** Never approve a PR in a hurry or just to meet a deadline.

After approving the PR, ping the author in the EHR Discord channel.

**Linear**
Once the PR is merged, move it to the "Done" column.

## 5. Responding to Review Feedback
Reply to comments and make revisions in a timely manner. Ping the reviewer after committing revisions. If you disagree with feedback, explain your reasoning and have a discussion.

Reply to every comment received and resolve it once you've made the appropriate updates or an agreement has been made offline. Responses can be short. "Done" is acceptable.
