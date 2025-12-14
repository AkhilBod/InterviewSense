"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type RotatingTextProps = {
  texts: string[]
  mainClassName?: string
  staggerFrom?: "first" | "last"
  initial?: any
  animate?: any
  exit?: any
  staggerDuration?: number
  splitLevelClassName?: string
  transition?: any
  rotationInterval?: number
}

export default function RotatingText({
  texts,
  mainClassName = "inline-flex items-center",
  staggerFrom = "first",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.03,
  splitLevelClassName = "overflow-hidden inline-block",
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!texts || texts.length === 0) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % texts.length)
    }, rotationInterval)
    return () => clearInterval(id)
  }, [texts, rotationInterval])

  if (!texts || texts.length === 0) return null

  const parentVariants = {
    initial: {},
    animate: { transition: { staggerChildren: staggerDuration, staggerDirection: staggerFrom === 'last' ? -1 : 1 } },
    exit: { transition: { staggerChildren: staggerDuration, staggerDirection: staggerFrom === 'last' ? -1 : 1 } },
  }

  const childVariants = {
    initial,
    animate,
    exit,
  }

  const word = texts[index]
  const chars = word.split("")

  return (
    <div className={mainClassName} aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          variants={parentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="inline-block"
        >
          <span className={splitLevelClassName} aria-hidden>
            {chars.map((c, i) => (
              <motion.span
                style={{ display: 'inline-block' }}
                key={i}
                variants={childVariants}
                transition={transition}
              >
                {c === ' ' ? '\u00A0' : c}
              </motion.span>
            ))}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
