export class BookValidator {
  static isValidBookId(bookId: string): boolean {
    if (this.isUuid(bookId)) {
      return true
    }
    return false
  }

  static isValidBookTitle(bookTitle: string): boolean {
    if (this.isAlphaNumeric(bookTitle) && this.isValidLength(bookTitle)) {
      return true
    }
    return false
  }

  private static isAlphaNumeric(str: string): boolean {
    if (str.match(/^[a-z0-9]+$/i)) {
      return true
    }
    return false
  }

  private static isValidLength(str: string): boolean {
    const maxLength = 20

    if (str.split('').length <= maxLength) {
      return true
    }
    return false
  }

  private static isUuid(str: string): boolean {
    if (str.match(/^[a-z0-9\-]+$/i)) {
      return true
    }
    return false
  }
}
