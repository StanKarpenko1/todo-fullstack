 export const forgotPassword = async (req: Request, res: Response) => {
    // 1. Validate email
    const { error, value } = forgotPasswordSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email } = value;

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // 3. Security: Return same message even if user doesn't exist
    if (!user) {
      return res.json({
        message: 'Reset link has been sent'
      });
    }

    // 4. Generate reset token (32 random bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 5. Hash the token before storing (security - never store plaintext)
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // 6. Calculate expiry (1 hour from now)
    const resetTokenExpires = new Date(Date.now() + 3600000);

    // 7. Store hashed token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpires
      }
    });

    // 8. Return success with plain token (user needs this for reset)
    res.json({
      message: 'Reset link has been sent',
      resetToken  // Plain token (NOT hashed) - user will use this
    });
  };