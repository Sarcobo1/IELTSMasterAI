export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2
}

export function validateMessage(message: string): boolean {
  return message.trim().length >= 10
}

export function getValidationError(field: string, value: string): string {
  if (!value.trim()) {
    return `${field} is required`
  }

  if (field === "email" && !validateEmail(value)) {
    return "Please enter a valid email"
  }

  if (field === "name" && !validateName(value)) {
    return "Name must be at least 2 characters"
  }

  if (field === "message" && !validateMessage(value)) {
    return "Message must be at least 10 characters"
  }

  return ""
}
