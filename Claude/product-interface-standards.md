
# PRODUCT INTERFACE STANDARDS
## Universal UI Rules for Building Highly Consistent Digital Products

This document defines **strict interface standards** used to maintain visual and interaction consistency across a digital product.

It is inspired by interface guidelines used by leading product companies such as:

- Stripe
- Linear
- Notion
- Airbnb
- Vercel
- Apple
- Google

The objective is to ensure that every screen in the product feels:

- coherent
- intentional
- predictable
- professional
- easy to use

This document acts as the **final layer above the design system**, defining how components must actually be used in real interfaces.

---

# 1. CORE INTERFACE PRINCIPLES

All product interfaces must follow these principles.

### Clarity
The user must understand the purpose of the screen within seconds.

### Consistency
Elements performing the same function must always look and behave the same.

### Hierarchy
Important elements must visually dominate secondary elements.

### Efficiency
Interfaces should minimize user effort.

### Predictability
Users should never be surprised by interface behavior.

---

# 2. PAGE STRUCTURE STANDARD

Every product page should follow a predictable structure.

## Page Header

Contains:

- page title
- short description (optional)
- primary action
- secondary actions

The header introduces the purpose of the page.

## Main Content

Contains the main functionality.

Examples:

- dashboard metrics
- forms
- tables
- editors
- workflows

## Secondary Information

Contains contextual information such as:

- activity logs
- tips
- help documentation
- advanced options

---

# 3. VISUAL HIERARCHY RULES

Hierarchy must be visible through:

- typography scale
- spacing
- color emphasis
- component size

Priority order:

1. Primary action
2. Key data
3. Secondary controls
4. Contextual information

Nothing should visually compete with the primary task.

---

# 4. BUTTON USAGE RULES

Buttons must follow strict hierarchy.

### Primary Button

Used for the main action of the page.

Only **one primary button per section**.

### Secondary Button

Used for secondary actions.

### Ghost Button

Used for low-priority actions.

### Destructive Button

Used only for dangerous actions.

Button hierarchy must be visually clear.

---

# 5. FORM INTERFACE STANDARDS

Forms must be designed for speed and clarity.

## Field Layout

Fields should be grouped by logical sections.

Avoid long vertical walls of fields.

## Labels

Labels must:

- be clear
- be concise
- appear above fields

## Validation

Errors must:

- appear near the field
- explain the problem
- suggest correction

---

# 6. TABLE DESIGN RULES

Tables must remain readable.

Rules:

- numeric values right-aligned
- text values left-aligned
- headers clearly separated
- row hover feedback
- consistent column spacing

Tables should support:

sorting  
filtering  
pagination  

---

# 7. DASHBOARD INTERFACE RULES

Dashboards must highlight **insight first**.

Recommended layout:

Top row:

Key metrics

Middle section:

Charts and trends

Lower section:

Tables or activity logs

Users should identify key information immediately.

---

# 8. CARD DESIGN RULES

Cards represent grouped information.

Cards must contain:

- clear title
- concise content
- logical spacing
- optional actions

Cards should not contain too many elements.

---

# 9. EMPTY STATE DESIGN

Empty states must guide the user.

They should include:

- explanation
- suggested action
- primary button

Avoid empty screens without explanation.

---

# 10. LOADING STATE DESIGN

Loading states improve perceived performance.

Examples:

- skeleton loaders
- progress indicators
- placeholder cards

Loading states must indicate that work is in progress.

---

# 11. ERROR STATE DESIGN

Error messages must be:

- human readable
- actionable
- contextual

Avoid technical language.

Provide guidance when possible.

---

# 12. SEARCH AND FILTER PATTERNS

Search interfaces should provide:

- clear search field
- instant feedback
- filter options
- result summaries

Users should easily refine results.

---

# 13. NAVIGATION STANDARDS

Navigation must remain stable across the product.

Examples:

Sidebar navigation for complex applications.

Top navigation for simpler products.

Command palette for power users.

Users must always know how to return to previous sections.

---

# 14. RESPONSIVE INTERFACE RULES

Responsive behavior must preserve hierarchy.

On smaller screens:

- stack elements vertically
- simplify layouts
- prioritize primary actions

Never hide critical functionality.

---

# 15. ACCESSIBILITY STANDARDS

Interfaces must meet accessibility requirements.

Ensure:

- sufficient color contrast
- keyboard navigation
- visible focus states
- readable font sizes

Accessibility improves usability for everyone.

---

# 16. INTERACTION FEEDBACK

Every interaction should produce feedback.

Examples:

- button pressed states
- confirmation messages
- visual changes after actions

Users must feel in control of the system.

---

# 17. DESIGN QUALITY REVIEW

Before releasing a new screen verify:

- hierarchy clarity
- component consistency
- spacing alignment
- responsive behavior
- accessibility compliance
- loading states implemented
- empty states designed
- error states handled

---

# 18. INTERFACE MATURITY GOAL

A mature interface should feel:

- effortless
- clear
- stable
- fast
- predictable

Users should never need to learn how to use the interface.

The design should guide them naturally.
